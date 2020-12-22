import { Values } from './values.model'
export interface Category {
    category: string;
    value: Values[];
   }

  export const newCategory:Category = {
    category: '',
    value: [],
  }


