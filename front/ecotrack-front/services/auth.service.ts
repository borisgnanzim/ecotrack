import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
}

export const register = async (data: RegisterPayload) => {
  console.log('On envoie ', data)
  const response = await axios.post(`${API_URL}/auth/register/citizen`, data);
  console.log('La réponse : ', response)
  return response.data;
};
