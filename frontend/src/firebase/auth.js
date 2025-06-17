import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";

// Đăng nhập bằng Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user; // Trả về thông tin user
  } catch (error) {
    console.error("Lỗi đăng nhập Google:", error);
    throw error;
  }
};

// Đăng nhập bằng Facebook
export const loginWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    return result.user;
  } catch (error) {
    console.error("Lỗi đăng nhập Facebook:", error);
    throw error;
  }
};

// Đăng xuất
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
  }
};
