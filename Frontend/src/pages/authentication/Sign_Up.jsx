import { React, useState } from "react";
import { NavLink } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { APIS } from "../../../config/Config";

export const Sign_Up = () => {
  const [preview, setPreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      image: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().min(2, "Too short!").required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(6, "At least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm your password"),
      image: Yup.mixed().required("Profile image is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("image", values.image);

      APIS.signup(formData)
        .then((res) => console.log(res))
        .catch((err) => console.log(err));

      setSubmitting(false);
    },
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      formik.setFieldValue("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row w-full h-screen bg-gray-100">
      <div className="w-full sm:w-1/2  flex flex-col justify-center items-center p-6 md:p-10 bg-white shadow-lg">
        <div className=" flex items-center sm:static pb-2 sm:mb-6">
          <div className="w-8 h-8 bg-black rounded-full mr-2"></div>
          <h1 className="text-2xl md:text-3xl  font-bold text-gray-800">
            RATE A PROPERTY
          </h1>
        </div>

        <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-white text-2xl font-semibold mb-6 text-center">
            Sign Up
          </h2>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Enter Your Name"
              className="w-full px-4 py-2 sm:py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-400">{formik.errors.name}</p>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-4 py-2 sm:py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-400">{formik.errors.email}</p>
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full px-4 py-2 sm:py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-400">{formik.errors.password}</p>
            )}

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 sm:py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
            />
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="text-red-400">{formik.errors.confirmPassword}</p>
              )}

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-white bg-gray-700 rounded-md p-2"
            />
            {formik.touched.image && formik.errors.image && (
              <p className="text-red-400">{formik.errors.image}</p>
            )}

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-4 w-24 h-24 object-cover rounded-full mx-auto"
              />
            )}

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-md transition font-semibold"
            >
              {formik.isSubmitting ? "Signing Up..." : "Sign Up ➤"}
            </button>
          </form>

          <p className="text-gray-400 text-center mt-4">
            Already have an account?{" "}
            <NavLink
              to="/signin"
              className="text-blue-400 hover:text-blue-300 transition font-semibold"
            >
              Sign In
            </NavLink>
          </p>
        </div>
      </div>
      <div className="w-full sm:w-1/2 flex flex-col justify-center items-center bg-blue-600 text-white text-center p-6 sm:p-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Join RATE A PROPERTY
        </h2>
        <p className="text-base sm:text-lg max-w-md">
          Create an account to rate, review, and explore properties. Start your
          journey today!
        </p>
      </div>
    </div>
  );
};
