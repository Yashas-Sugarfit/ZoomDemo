import React from "react";
import "./styles.css";

const Button = (buttonProps) => {
  const { children, loading, ...rest } = buttonProps;

  return (
    <button className="btn-zoom-demo" {...rest}>
      {children}
      {loading && <img src="/loading.svg" />}
    </button>
  );
};

export default Button;
