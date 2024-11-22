const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const axios = require("axios");
const sharp = require("sharp");
const url =
  "http://sd.fc-stable-diffusion-api.1542382262313179.cn-hangzhou.fc.devsapp.net";
async function sendRequest(payload) {
  try {
    const response = await axios.post(`${url}/sdapi/v1/img2img`, payload);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
async function encodeImageToBase64(imagePath) {
  // const image = await readFile(imagePath);
  const image = await sharp(imagePath).png().toBuffer();
  const encodedImage = Buffer.from(image).toString("base64");
  return encodedImage;
}
async function init() {
  const encodedImage = await encodeImageToBase64(
    path.join(__dirname, "./public/test.png")
  );
  console.log(encodedImage);
  // const payload = {
  //     prompt: "a cartoon character",
  //     negative_prompt: "",
  //     styles: ["cartoonize"],
  //     seed: -1,
  //     subseed: -1,
  //     subseed_strength: 0,
  //     seed_resize_from_h: -1,
  //     seed_resize_from_w: -1,
  //     sampler_name: "string",
  //     batch_size: 1,
  //     n_iter: 1,
  //     steps: 50,
  //     cfg_scale: 7,
  //     width: 512,
  //     height: 512,
  //     restore_faces: true,
  //     tiling: true,
  //     do_not_save_samples: false,
  //     do_not_save_grid: false,
  //     eta: 0,
  //     denoising_strength: 0.75,
  //     s_min_uncond: 0,
  //     s_churn: 0,
  //     s_tmax: 0,
  //     s_tmin: 0,
  //     s_noise: 0,
  //     override_settings: {},
  //     override_settings_restore_afterwards: true,
  //     refiner_checkpoint: "string",
  //     refiner_switch_at: 0,
  //     disable_extra_networks: false,
  //     comments: {},
  //     init_images: [encodedImage],
  //     resize_mode: 0,
  //     image_cfg_scale: 0,
  //     mask: "string",
  //     mask_blur_x: 4,
  //     mask_blur_y: 4,
  //     mask_blur: 0,
  //     inpainting_fill: 0,
  //     inpaint_full_res: true,
  //     inpaint_full_res_padding: 0,
  //     inpainting_mask_invert: 0,
  //     initial_noise_multiplier: 0,
  //     latent_mask: "string",
  //     sampler_index: "Euler",
  //     include_init_images: false,
  //     script_name: "string",
  //     script_args: [],
  //     send_images: true,
  //     save_images: false,
  //     alwayson_scripts: {},
  //   };
  const payload = {
    prompt:
      "RAW photo, best quality, realistic,CANNO EOS R3, photo-realistic:1.3, masterpiece, ultra-detailed, CG unity, 8k wallpaper, amazing, finely detailed,( light smile: 0.9), highres, iu, asymmetrical bangs, short bangs, pureerosface_v1, beautiful detailed girl, extremely detailed eyes and face, beautiful detailed eyes, light on face, looking at viewer, straight-on, staring, closed mouth, black hair, long hair, collarbone, bare shoulders, long eyelashes, upper body, 1girl, full body:1.3, highly detailed face: 1.5, beautiful ponytail:0.5, beautiful detailed eyes, beautiful detailed nose, realistic face, realistic body, comfortable expressions, smile, look at viewer, comfortable expressions,fit model, hotel room, boudoir photography, upscale business hotel, luxurious decorations, expensive furniture, clean room, tasteful poses, lying on bed, sitting on sofa, showcasing beautiful body, modestly covered, pure, beautiful, soft lighting, professional equipment, camera settings, focal length, wardrobe details, model's expression, eye contact, sexy clothing, clean, bright scene, comfortable, (soft cinematic light:1.2), (depth of field:1.4), (intricate details:1.12), (sharp, exposure blend, medium shot:1.2), (natural skin texture, hyperrealism:1.2)",
    negative_prompt:
      "(deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, watermark, (deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, watermark",
    override_settings: {
      sd_model_checkpoint: "Chilloutmix-Ni",
    },
    seed: -1,
    batch_size: 1,
    n_iter: 1,
    steps: 20,
    cfg_scale: 7,
    width: 512,
    height: 768,
    restore_faces: false,
    tiling: false,
    eta: 0,
    script_args: [],
    sampler_index: "DPM++ SDE Karras",
    init_images: [
        encodedImage],
    mask: "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",
    resize_mode: 1,
    denoising_strength: 0.7,
    mask_blur: 10,
    inpainting_fill: 1,
    inpaint_full_res: true,
    inpaint_full_res_padding: 32,
    inpainting_mask_invert: 1,
    alwayson_scripts: {
    },
  };
  sendRequest(payload);
}
init();
