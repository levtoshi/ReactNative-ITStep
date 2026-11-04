import {IImageFile} from "@/types/common/IImageFile";

export interface IProfileType {
    name: string;
    email: string;
    imageFile?: IImageFile;
}