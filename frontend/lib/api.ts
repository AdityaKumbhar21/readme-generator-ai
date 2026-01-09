const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ReadmeCreateRequest {
  project_name: string;
  tech_stack: string;
  languages: string;
  description: string;
}

export interface ReadmeJobResponse {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  prompt: string | null;
  error: string | null;
  completed_at: string | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export async function createReadmeJob(
  data: ReadmeCreateRequest
): Promise<ReadmeJobResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create README job");
  }

  return response.json();
}

export async function getJobStatus(jobId: string): Promise<ReadmeJobResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get job status");
  }

  return response.json();
}

// Poll for job completion
export async function pollJobStatus(
  jobId: string,
  onUpdate: (job: ReadmeJobResponse) => void,
  interval: number = 1000
): Promise<ReadmeJobResponse> {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const job = await getJobStatus(jobId);
        onUpdate(job);

        if (job.status === "completed" || job.status === "failed") {
          resolve(job);
        } else {
          setTimeout(poll, interval);
        }
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}
