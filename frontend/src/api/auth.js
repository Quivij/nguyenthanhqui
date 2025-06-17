import api from "./api"; // import instance api của bạn

export const loginUser = async ({ email, password }) => {
  const response = await api.post(
    "users/login",
    { email, password },
    { withCredentials: true } // ✅ Cần thiết để cookie từ backend được lưu
  );
  return response.data;
};

export const registerUser = async ({
  name,
  email,
  password,
  confirmPassword,
}) => {
  const response = await api.post("users/register", {
    name,
    email,
    password,
    confirmPassword,
  });
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("users/logout");
  return response.data;
};

export const fetchProfile = async () => {
  const response = await api.get("users/profile");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put("users/profile", data);
  return response.data;
};

export const getAllUsers = async ({ search, page = 1, limit = 10 }) => {
  const res = await api.get("/users", {
    params: { search, page, limit },
  });
  return res.data;
};

export const deleteUserById = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};
export const updateUserById = async (userId, data) => {
  const response = await api.put(`/users/${userId}`, data);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};
export const createUser = async (userData) => {
  const res = await api.post("/users", userData);
  return res.data;
};
export const loginWithGoogle = async (token) => {
  const response = await api.post(
    "users/google-login",
    { token },
    { withCredentials: true } // ✅ Thêm dòng này
  );
  return response.data;
};
