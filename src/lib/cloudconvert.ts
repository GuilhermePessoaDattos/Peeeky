import CloudConvert from "cloudconvert";

const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY!);

export async function convertPptxToPdf(fileBuffer: Buffer, fileName: string): Promise<Buffer> {
  const job = await cloudConvert.jobs.create({
    tasks: {
      upload: {
        operation: "import/upload",
      },
      convert: {
        operation: "convert",
        input: ["upload"],
        input_format: "pptx",
        output_format: "pdf",
      },
      download: {
        operation: "export/url",
        input: ["convert"],
      },
    },
  });

  const uploadTask = job.tasks.find((t) => t.name === "upload")!;
  await cloudConvert.tasks.upload(uploadTask, fileBuffer, fileName);

  const completed = await cloudConvert.jobs.wait(job.id);

  const downloadTask = completed.tasks.find(
    (t) => t.name === "download" && t.status === "finished"
  );

  if (!downloadTask?.result?.files?.[0]?.url) {
    throw new Error("PPTX conversion failed: no output file");
  }

  const response = await fetch(downloadTask.result.files[0].url);
  if (!response.ok) {
    throw new Error(`Failed to download converted PDF: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
