import React from "react";
import "./styles.css";

const Button = (buttonProps) => {
  const { children, loading, ...rest } = buttonProps;

  return (
    <button className="btn-zoom-demo" {...rest}>
      {loading ? <img src="/loading.svg" /> : children}
    </button>
  );
};

export default Button;
