import ZAI from "z-ai-web-dev-sdk";

async function create() {
  try {
    const zai = await ZAI.create();

    console.log("Creating video generation task...");

    const task = await zai.video.generations.create({
      prompt: "A cat is playing with a ball.",
      quality: "speed",
      with_audio: false,
      size: "1920x1080",
      fps: 30,
      duration: 5,
    });

    console.log(`Task created!`);
    console.log(`Task ID: ${task.id}`);
    console.log(`Task Status: ${task.task_status}`);
    console.log(`Model: ${task.model || 'N/A'}`);

    return { zai, task };
  } catch (err: any) {
    console.error("Video generation failed:", err?.message || err);
    throw err;
  }
}

async function query(zai: any, taskId: string) {
  try {
    // 首次查询
    let result = await zai.async.result.query(taskId);
    
    if (result.task_status === 'SUCCESS') {
      // 如果任务立即完成，直接返回结果
      console.log("\nTask completed immediately, fetching result...");
      displayResult(result);
      return result;
    }

    // 轮询查询结果
    console.log("\nPolling for result...");
    let pollCount = 0;
    const maxPolls = 30; // 最多轮询30次
    const pollInterval = 10000; // 每10秒查询一次

    while (result.task_status === 'PROCESSING' && pollCount < maxPolls) {
      pollCount++;
      console.log(`Poll ${pollCount}/${maxPolls}: Status is ${result.task_status}, waiting ${pollInterval / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      result = await zai.async.result.query(taskId);
    }

    displayResult(result);
    return result;
  } catch (err: any) {
    console.error("Query failed:", err?.message || err);
    throw err;
  }
}

async function main() {
  try {
    const { zai, task } = await create();
    await query(zai, task.id);
  } catch (err: any) {
    console.error("Video generation failed:", err?.message || err);
    process.exit(1);
  }
}

function displayResult(result: any) {
  console.log("\n=== Result ===");
  console.log(`Task Status: ${result.task_status}`);
  console.log(`Model: ${result.model || 'N/A'}`);
  console.log(`Request ID: ${result.request_id || 'N/A'}`);

  if (result.task_status === 'SUCCESS') {
    // 尝试从多种可能的字段中获取视频URL
    const videoUrl = 
      result.video_result?.[0]?.url || 
      result.video_url || 
      result.url || 
      result.video;

    if (videoUrl) {
      console.log(`\n✅ Video generated successfully!`);
      console.log(`Video URL: ${videoUrl}`);
      console.log(`\nYou can open this URL in your browser or download it.`);
    } else {
      console.log(`\n⚠️ Task completed but video URL not found in response.`);
      console.log(`Full response:`, JSON.stringify(result, null, 2));
    }
  } else if (result.task_status === 'PROCESSING') {
    console.log(`\n⏳ Task is still processing. Please try again later.`);
    console.log(`Task ID: ${result.id || 'N/A'}`);
  } else if (result.task_status === 'FAIL') {
    console.log(`\n❌ Task failed.`);
    console.log(`Full response:`, JSON.stringify(result, null, 2));
  }
}

main();
