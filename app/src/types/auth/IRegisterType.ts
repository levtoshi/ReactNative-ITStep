import {IImageFile} from "@/types/common/IImageFile";

export interface IRegisterType {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    imageFile?: IImageFile;
}