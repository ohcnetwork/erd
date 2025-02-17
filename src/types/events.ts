import { ChangeEvent, KeyboardEvent } from "react";

export type InputChangeEvent = ChangeEvent<HTMLInputElement>;
export type TextareaChangeEvent = ChangeEvent<HTMLTextAreaElement>;
export type KeyDownEvent = KeyboardEvent<HTMLInputElement>;
