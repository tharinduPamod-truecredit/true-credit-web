import { useForm } from "react-hook-form";
import { useState } from "react";
import "./Login.css";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    // Here you would make your API call
    if (isLogin) {
      // Login logic
      console.log("Logging in with:", {
        email: data.email,
        password: data.password,
      });
    } else {
      // Register logic
      console.log("Registering with:", {
        username: data.username,
        email: data.email,
        password: data.password,
      });
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    reset(); // Reset form when toggling
  };

  return (
    <div className="auth-container">
      <h1>{isLogin ? "Login" : "Register"}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              {...register("username", {
                required: !isLogin && "Username is required",
              })}
              className={errors.username ? "error" : ""}
            />
            {errors.username && (
              <span className="error-message">{errors.username.message}</span>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Email is invalid",
              },
            })}
            className={errors.email ? "error" : ""}
          />
          {errors.email && (
            <span className="error-message">{errors.email.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className={errors.password ? "error" : ""}
          />
          {errors.password && (
            <span className="error-message">{errors.password.message}</span>
          )}
        </div>

        {!isLogin && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                required: !isLogin && "Please confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
              className={errors.confirmPassword ? "error" : ""}
            />
            {errors.confirmPassword && (
              <span className="error-message">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>
        )}

        <button type="submit" className="submit-btn">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      <p className="toggle-form">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button type="button" onClick={toggleForm} className="toggle-btn">
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default Login;
