import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import theme from "../../theme/theme";

const MySwal = withReactContent(Swal);

export function ShowError(title, text) {
  MySwal.fire({
    icon: "error",
    title: title,
    html: <div style={{ marginBottom: 2 }}>{text}</div>,
    confirmButtonColor: "#FF9843",
    confirmButtonText: "ตกลง",
  });
}

export function ShowWarning(title, text) {
  MySwal.fire({
    icon: "warning",
    title: title,
    html: <div style={{ marginBottom: 2 }}>{text}</div>,
    confirmButtonColor: "#ffc400",
    confirmButtonText: "ตกลง",
  });
}

export function ShowSuccess(title, item) {
  MySwal.fire({
    icon: "success",
    title: title,
    showConfirmButton: false,
    timer: 1000,
  }).then(() => {
    if (typeof item === "function") item();
  });
}

export function ShowInfo(title, text) {
  MySwal.fire({
    icon: "info",
    title: title,
    html: <div style={{ marginBottom: 2 }}>{text}</div>,
    confirmButtonColor: "#FF9843",
    confirmButtonText: "ตกลง",
  });
}

export function ShowConfirm(title, onConfirm, onCancel) {
  MySwal.fire({
    icon: "info",
    title: title,
    showCancelButton: true,
    confirmButtonColor: theme.palette.success.main,
    cancelButtonColor: theme.palette.error.main,
    confirmButtonText: "ตกลง",
    cancelButtonText: "ยกเลิก",
  }).then((result) => {
    if (result.isConfirmed) {
      if (onConfirm) onConfirm();
    } else if (result.isDismissed) {
      if (onCancel) onCancel();
    }
  });
}

export function showLogin(title, item) {
  MySwal.fire({
    imageWidth: 200,
    imageHeight: 200,
    imageAlt: "Logo",
    customClass: {
      popup: "my-swal",
    },
    title: title,
    color: theme.palette.success.main,
    showConfirmButton: false,
    timer: 1300,
  }).then(() => {
    if (typeof item === "function") item();
  });
}

export function showLogout(title, item) {
  MySwal.fire({
    imageWidth: 200,
    imageHeight: 200,
    imageAlt: "Logo",
    customClass: {
      popup: "my-swal",
    },
    title: title,
    color: theme.palette.error.main,
    showConfirmButton: false,
    timer: 1300,
  }).then(() => {
    if (typeof item === "function") item();
  });
}
