"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const filterOptions = [
  { name: "Grayscale", filter: "grayscale" },
  { name: "Sepia", filter: "sepia" },
  { name: "Blur", filter: "blur" },
  { name: "Polarizer", filter: "polarizer" },
  { name: "Infrared", filter: "infrared" },
  { name: "Dual-Color", filter: "dualColor" },
];

type FilterSettings = {
  [filter: string]: number; // Scale from 0 to 100
};

const defaultFilterSettings: FilterSettings = filterOptions.reduce(
  (acc, option) => {
    acc[option.filter] = 0; // Initialize all filters to 0
    return acc;
  },
  {} as FilterSettings
);

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(defaultFilterSettings);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFilterChange = (filter: string, value: number) => {
    setFilterSettings((prevSettings) => ({
      ...prevSettings,
      [filter]: value,
    }));
  };

  const getFilterStyle = () => {
    let filterStyle = "";
    if (filterSettings.grayscale > 0) {
      filterStyle += `grayscale(${filterSettings.grayscale}%) `;
    }
    if (filterSettings.sepia > 0) {
      filterStyle += `sepia(${filterSettings.sepia}%) `;
    }
    if (filterSettings.blur > 0) {
      filterStyle += `blur(${filterSettings.blur * 0.01}rem) `;
    }
    if (filterSettings.polarizer > 0) {
      filterStyle += `contrast(${100 + filterSettings.polarizer/5}%) brightness(${100 - filterSettings.polarizer/10}%) `;
    }
    if (filterSettings.infrared > 0) {
      filterStyle += `hue-rotate(${filterSettings.infrared * 3.6}deg) brightness(${100 + filterSettings.infrared/10}%) `;
    }
    if (filterSettings.dualColor > 0) {
      filterStyle += `sepia(${filterSettings.dualColor}%) hue-rotate(${filterSettings.dualColor * 0.6}deg) `;
    }
    return filterStyle.trim();
  };


  const handleDownload = () => {
    if (!image) return;

    const canvas = document.createElement("canvas");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.filter = getFilterStyle();
      ctx.drawImage(img, 0, 0);

      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "filtered_image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src = image;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-6xl font-bold text-center">FilterForge</CardTitle>
          <CardDescription className="text-center text-lg text-muted-foreground">Apply uncommon filters to your photos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col md:flex-row items-center justify-center p-4 border-2 border-dashed rounded-md bg-secondary">
             <div className="flex flex-col items-center justify-center p-4">
              {image ? (
                <>
                  <p className="text-center text-md text-muted-foreground mb-2">Original Image</p>
                  <img
                    src={image}
                    alt="Uploaded"
                    className="max-w-full max-h-64 rounded-md object-contain"
                  />
                </>
              ) : (
                <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  Upload Image
                  <Input type="file" id="image-upload" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </Label>
              )}
            </div>
               {image && (
                 <div className="flex flex-col items-center justify-center p-4">
                    <p className="text-center text-md text-muted-foreground mb-2">Filtered Image</p>
                    <img
                      src={image}
                      alt="Filtered"
                      className="max-w-full max-h-64 rounded-md object-contain"
                      style={{ filter: getFilterStyle() }}
                    />
                  </div>
               )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterOptions.map((option) => (
              <div key={option.name}>
                <Label htmlFor={`${option.filter}-slider`}>{option.name}</Label>
                <Slider
                  id={`${option.filter}-slider`}
                  defaultValue={[filterSettings[option.filter]]}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleFilterChange(option.filter, value[0])}
                />
              </div>
            ))}
          </div>

          <Separator />

          <Button disabled={!image} onClick={handleDownload} className="w-full">
            Download Filtered Image
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

