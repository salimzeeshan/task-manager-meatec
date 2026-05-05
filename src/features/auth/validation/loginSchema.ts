import * as yup from 'yup';

export const loginSchema = yup.object({
  username: yup.string().required('Username is required').trim(),
  password: yup.string().required('Password is required'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
