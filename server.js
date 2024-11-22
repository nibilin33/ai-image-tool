const express = require('express');
const openpose = require('openpose');

const app = express();

app.post('/get_head_top_position', (req, res) => {
  const image = req.body.image;

  // 使用 OpenPose 识别人体关键点
  const keypoints = openpose.detectPose(image);

  // 从关键点中找出头顶的位置
  const headTopPosition = keypoints[0]; // 这只是一个示例，实际的索引可能不同

  // 将头顶的位置返回给调用者
  res.json({ headTopPosition });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});