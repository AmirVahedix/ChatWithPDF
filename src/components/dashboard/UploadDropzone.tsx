import { useState } from "react";
import { useRouter } from "next/navigation";
import Dropzone from "react-dropzone";
import { Cloud, File as FileIcon } from "lucide-react";

import { useUploadThing } from "@/lib/uploadthing";
import { trpc } from "@/app/_trpc/client";

import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

const UploadDropzone = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { startUpload } = useUploadThing("pdfUploader");

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`);
    },
    retry: true,
    retryDelay: 2000,
  });

  const startStimulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 500);
    return interval;
  };

  const onDropHandler = async <T extends File>(acceptedFiles: T[]) => {
    setIsUploading(true);
    const progressInterval = startStimulateProgress();

    const res = await startUpload(acceptedFiles);

    if (!res) {
      return toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    }

    const [fileReponse] = res;
    const key = fileReponse?.key;

    if (!key) {
      return toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    }

    clearInterval(progressInterval);
    setUploadProgress(100);

    startPolling({ key });
  };

  return (
    <Dropzone multiple={false} onDrop={onDropHandler}>
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-zinc-500">PDF (up to 4MB)</p>
              </div>

              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <FileIcon className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                </div>
              ) : null}

              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

export default UploadDropzone;