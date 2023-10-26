"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useResizeDetector } from "react-resize-detector";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type Props = {
  url: string;
};

const PdfRenderer = ({ url }: Props) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrentPage(Number(page));
    setValue("page", String(page));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => {
      if (prev + 1 > numPages!) {
        setValue("page", String(numPages));
        return numPages!;
      } else {
        setValue("page", String(prev + 1));
        return prev + 1;
      }
    });
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => {
      if (prev - 1 > 1) {
        setValue("page", String(prev - 1));
        return prev - 1;
      } else {
        setValue("page", String(1));
        return 1;
      }
    });
  };

  const onError = () =>
    toast({
      title: "Error loading PDF",
      description: "Please try again later",
      variant: "destructive",
    });

  const onLoading = () => (
    <div className="flex justify-center">
      <Loader2 className="h-6 w-6 my-24 animate-spin" />
    </div>
  );

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            aria-label="previous page"
            disabled={currentPage <= 1}
            onClick={handlePreviousPage}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            aria-label="next page"
            disabled={numPages === undefined || currentPage === numPages}
            onClick={handleNextPage}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 w-full max-h-screen">
        <div ref={ref}>
          <Document
            loading={onLoading}
            onLoadError={onError}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
            }}
            file={url}
            className="max-h-full"
          >
            <Page width={width ? width : 1} pageNumber={currentPage} />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PdfRenderer;
