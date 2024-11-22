import "cropperjs/dist/cropper.css";
import Cropper from "cropperjs";
import Toast from "./component/toast";
import axios from "axios";
import { fabric } from "fabric";
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

fabric.Canvas.prototype.getAbsoluteCoords = function(object) {
  return {
    left: object.left + this._offset.left,
    top: object.top + this._offset.top
  };
}
// control_v11p_sd15_inpaint.pth
// control_v11p_sd15_openpose.pth
const STABLEAPI =
  "https://sd-fc-stabsion-api-hdwyqevizp.cn-hangzhou.fcapp.run";
// /sdapi/v1/img2img
const CARTOON3D =
  "https://model-model-bfgngghcbz.cn-hangzhou.fcapp.run/api/image-stylization"; // file

async function querySupportModel() {
  const response = await fetch(
    `${STABLEAPI}/controlnet/module_list`
  );
  const data = await response.json();
  console.log(data);
  // const modelList = await fetch(
  //   "https://sd-fc-stabsion-api-hdwyqevizp.cn-hangzhou.fcapp.run/controlnet/model_list"
  // );
  // const modelData = await modelList.json();
  // console.log(modelData);
}
querySupportModel();
function canvasToFile(filename) {
  return new Promise((resolve, reject) => {
    const img = document.getElementById("image");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas to Blob conversion failed"));
        return;
      }
      resolve(new File([blob], filename, { type: "image/png" }));
    });
  });
}
async function createMask() {
  const image = document.getElementById("mask");
  const maskBg = document.getElementById("image");
  const canvas = document.createElement("canvas");
  canvas.width = maskBg.width;
  canvas.height = maskBg.height;
  const context = canvas.getContext("2d");
  context.drawImage(image, maskBg.width / 4, 0);

  const imageData = context.getImageData(0, 0, maskBg.width, maskBg.height);
  const data = imageData.data;

  // 创建一个简单的 mask，有像素的地方为黑色，没有像素的地方为白色
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] !== 0) {
      // 如果 alpha 值不为 0，说明这个像素是有颜色的
      data[i] = 0; // red 值
      data[i + 1] = 0; // green 值
      data[i + 2] = 0; // blue 值
      data[i + 3] = 255;
    } else {
      // 如果 alpha 值为 0，说明这个像素是透明的
      data[i] = 255; // red 值
      data[i + 1] = 255; // green 值
      data[i + 2] = 255; // blue 值
      data[i + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);

  const maskUrl = canvas.toDataURL();
  document.getElementById("mask").src = maskUrl;
  const img = document.getElementById("image");
  let encoded_image = getEncodeImage();
  const payload = {
    prompt: "people,realistic,two cat_ears",
    negative_prompt: "cartoon",
    sampler_index: "DPM++ SDE Karras",
    denoising_strength: 0.75,
    seed: -1,
    batch_size: 1,
    n_iter: 1,
    steps: 20,
    resize_mode: 1,
    cfg_scale: 7,
    width: img.width,
    height: img.height,
    init_images: [encoded_image],
    mask: maskUrl,
    image_cfg_scale: 0.72,
    mask_blur: 0,
    inpainting_fill: 1, // 蒙版遮住的内容， 0填充， 1原图 2潜空间噪声 3潜空间数值零
    inpaint_full_res: false, // # inpaint area, False: whole picture True：only masked
    inpaint_full_res_padding: 160, // 仅蒙版绘制参考半径(像素)
    inpainting_mask_invert: 1, // 蒙版模式 0重绘蒙版内容 1 重绘非蒙版内容
  };
  const loading = new Toast({
    type: "loading",
    duration: null,
  });
  loading.show();

  const response = await fetch(`${STABLEAPI}/sdapi/v1/img2img`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const res = await response.json();
  const dataUrl = res.images[0];
  document.getElementById("result").innerHTML = `<img  style="width:${
    img.width * 0.5
  }px;height:${img.height * 0.5}px;" src="data:image/png;base64,${dataUrl}">`;
  loading.destroy();
}
function getEncodeImage(mask) {
  const img = document.getElementById("image");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0, img.width, img.height);
  if (mask) {
    ctx.drawImage(mask.img, mask.x, mask.y, mask.width, mask.height);
  }
  return canvas.toDataURL("image/png");
}
async function styleTransfer() {
  let encoded_image = getEncodeImage();
  const img = document.getElementById("image");
  const payload = {
    prompt: "cartoon",
    negative_prompt: "realistic",
    override_settings: {
      sd_model_checkpoint: "cc-by-nc-sa-4.0",
    },
    denoising_strength: 0.35,
    seed: -1,
    batch_size: 1,
    n_iter: 1,
    steps: 10,
    resize_mode: 1,
    cfg_scale: 3,
    width: img.width,
    height: img.height,
    init_images: [encoded_image],
    image_cfg_scale: 0.5,
  };
  const loading = new Toast({
    type: "loading",
    duration: null,
  });
  loading.show();

  const response = await fetch(`${STABLEAPI}/sdapi/v1/img2img`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  const dataUrl = data.images[0];
  document.getElementById("result").innerHTML = `<img  style="width:${
    img.width * 0.5
  }px;height:${img.height * 0.5}px;" src="data:image/png;base64,${dataUrl}">`;
  loading.destroy();
}
async function imageCrop(cropper) {
  var canvas = cropper.getCroppedCanvas({
    width: 200,
    height: 200,
  });
  var dataUrl = cropper
    .getCroppedCanvas({
      width: 200,
      height: 200,
    })
    .toDataURL("image/jpeg");
  document.getElementById("result").innerHTML = '<img src="' + dataUrl + '">';
}
function pickerImage(cropper) {
  const input = document.getElementById("input");
  input.addEventListener("change", (e) => {
    const files = e.target.files;
    const done = function (url) {
      input.value = "";
      image.src = url;
      cropper.destroy();
      cropper = new Cropper(image, {
        aspectRatio: 1, // 设置剪裁框的纵横比
        crop: function (event) {
          console.log(event.detail.x);
          console.log(event.detail.y);
          console.log(event.detail.width);
          console.log(event.detail.height);
          console.log(event.detail.rotate);
          console.log(event.detail.scaleX);
          console.log(event.detail.scaleY);
        },
      });
    };
    let reader, file;

    if (files && files.length > 0) {
      file = files[0];

      if (URL) {
        done(URL.createObjectURL(file));
      } else if (FileReader) {
        reader = new FileReader();
        reader.onload = function (e) {
          done(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  });
}
async function stylization3D() {
  // multipart/form-data; boundary=
  const loading = new Toast({
    type: "loading",
    duration: null,
  });
  loading.show();
  const file = await canvasToFile("test.png");
  let formData = new FormData();
  formData.append("file", file);
  const res = await axios.post(CARTOON3D, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "blob",
  });
  const url = URL.createObjectURL(res.data);
  document.getElementById("result").innerHTML = '<img src="' + url + '">';
  loading.destroy();
}

async function createPuzzle() {
  const canvas = new fabric.Canvas("puzzle");
  const btn1 = document.getElementById("puzzle-input-0");
  const btn2 = document.getElementById("puzzle-input-1");
  function addPuzzleEvent() {
    document.getElementById("savePuzzle").addEventListener("click", (e) => {
      const dataURL = canvas.toDataURL();
       document.getElementById("result").innerHTML = '<img src="' + dataURL + '">';
    })
  }
  addPuzzleEvent();
  function positionBtn(obj,btn) {
    const absCoords = obj.getBoundingRect();
    btn.style.left = (absCoords.left+50) + 'px';
    btn.style.top = (absCoords.top + 50) + 'px';
  }
  function loadImage(id,callback) {
    const input = $(`#${id} input`);
    // document.getElementById(id);
    input.on("change", (e) => {
      const files = e.target.files;
      const done = function (url) {
        input.value = "";
        callback(url)
      };
      let reader, file;
      if (files && files.length > 0) {
        file = files[0];
  
        if (URL) {
          done(URL.createObjectURL(file));
        } else if (FileReader) {
          reader = new FileReader();
          reader.onload = function (e) {
            done(reader.result);
          };
          reader.readAsDataURL(file);
        }
      }
    });
  }
  const size = 200;
  fabric.Image.fromURL('/image-tool/public/loading.jpg', function(img) {
    canvas.add(img.set({left: 120,
      top: 100, angle: 30
     }));
      img.scaleToWidth(size);
      img.scaleToHeight(size);
    img.on('moving', function() { positionBtn(img,btn1) });
    img.on('scaling', function() { positionBtn(img,btn1) });
    positionBtn(img,btn1);
    loadImage('puzzle-input-0',function(url) {
      img.setSrc(url, function() {
        img.scaleToWidth(size);
        img.scaleToHeight(size);
        canvas.renderAll();
      });
    })
  });
  fabric.Image.fromURL('/image-tool/public/loading.jpg', function(img) {
    canvas.add(img.set({left: 120,
      top: 300, angle: 30 }));
      img.scaleToWidth(size);
      img.scaleToHeight(size);
    img.on('moving', function() { positionBtn(img,btn2) });
    img.on('scaling', function() { positionBtn(img,btn2) });
    positionBtn(img,btn2);
    loadImage('puzzle-input-1',function(url) {
      img.setSrc(url, function() {
        img.scaleToWidth(size);
        img.scaleToHeight(size);
        canvas.renderAll();
      });
    });
  });
}
async function previewPuzzle() {
  const puzzle = document.getElementById("puzzle");
  const dataURL = puzzle.toDataURL();
  document.getElementById("result").innerHTML = '<img src="' + dataURL + '">';
}
window.addEventListener("DOMContentLoaded", function () {
  const image = document.getElementById("image");
  let cropper = new Cropper(image, {
    aspectRatio: 1, // 设置剪裁框的纵横比
    crop: function (event) {
      console.log(event.detail);
    },
  });
  $(".container").on("click", (ev) => {
    const target = ev.target;
    const type = target.getAttribute("data-btn");
    console.log(type);
    if (type === "crop") {
      return imageCrop(cropper);
    }
    if (type === "image-stylization") {
      return stylization3D();
    }
    if (type === "styleTransfer") {
      return styleTransfer();
    }
    if (type === "texture") {
      return createMask();
    }
  });
  pickerImage(cropper);
  createPuzzle();
});
