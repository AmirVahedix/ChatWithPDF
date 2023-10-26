"use client";

import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useToast } from "@/components/ui/use-toast";
import { useResizeDetector } from "react-resize-detector";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type Props = {
  url: string;
};

const PdfRenderer = ({ url }: Props) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>(1);

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
            onClick={() =>
              setCurrentPage((prev) => (prev - 1 > 1 ? prev - 1 : 1))
            }
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input className="w-12 h-8 " />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            aria-label="next page"
            disabled={numPages === undefined || currentPage === numPages}
            onClick={() =>
              setCurrentPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1
              )
            }
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
