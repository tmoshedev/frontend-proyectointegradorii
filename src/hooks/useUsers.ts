import axios from 'axios';
import { UserLabel } from '../models';

export const useUsers = () => {
  const updateUserLabels = async (
    username: string,
    labels: UserLabel[],
    showToast: boolean = true
  ) => {
    const response = await axios.put(`/api/users/${username}/labels`, {
      labels,
    });
    return response.data;
  };

  return { updateUserLabels };
};
