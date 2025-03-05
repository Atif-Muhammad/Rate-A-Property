import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { NavLink, useNavigate } from "react-router-dom";
import { APIS } from "../../../config/Config";
import * as Yup from "yup";

export const Sign_In = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const SignIn = (values, { setSubmitting }) => {
    APIS.signin(values)
      .then((res) => {
        // alert(res);
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="flex flex-col sm:flex-row w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Left Section - Sign In Form */}
      <div className="w-full sm:w-1/2 flex flex-col justify-center items-center p-6 md:p-10  shadow-lg">
        {/* Logo */}
        <div className="flex items-center pb-2">
          <div className="w-8 h-8 bg-white rounded-full mr-2"></div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            RATE A PROPERTY
          </h1>
        </div>

        {/* Sign In Form */}
        <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-white text-2xl font-semibold mb-6 text-center">
            Sign In
          </h2>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={SignIn}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {/* Email Field */}
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full px-4 py-2 sm:py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <Field
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full px-4 py-2 sm:py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-md transition font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing In..." : "Sign In ➤"}
                </button>
              </Form>
            )}
          </Formik>

          {/* Sign Up Link */}
          <p className="text-gray-400 text-center mt-4">
            Don't have an account?{" "}
            <NavLink
              to="/signup"
              className="text-blue-400 hover:text-blue-300 transition font-semibold"
            >
              Sign Up
            </NavLink>
          </p>
        </div>
      </div>

      {/* Right Section - Welcome Message */}
      <div className="w-full sm:w-1/2 flex flex-col justify-center items-center bg-blue-600 text-white text-center p-6 sm:p-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Welcome to RATE A PROPERTY
        </h2>
        <p className="text-base sm:text-lg max-w-md">
          Discover, review, and share your experiences with properties
          worldwide. Join us today and make informed decisions!
        </p>
      </div>
    </div>
  );
};
