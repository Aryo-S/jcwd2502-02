import React from "react";
import Swal from "sweetalert2";
import { api } from "../api/api";

const ConfirmConfirmation = ({ itemId, onDelete, apiEndpoint, button, text, textOnButton, message, reloadPage = true, bodyValue }) => {
    const apiInstance = api()

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `${text}You won't be able to revert this!`,
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: "#d33",
            confirmButtonColor: "#039E57",
            cancelButtonText: "Cancel",
            confirmButtonText: textOnButton,
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                if (bodyValue) {
                    const softDeleteResponse = await apiInstance.patch(`${apiEndpoint}/${itemId}`, { email: bodyValue });

                }
                else {
                    const softDeleteResponse = await apiInstance.patch(`${apiEndpoint}/${itemId}`);

                }
                Swal.fire({
                    icon: "success",
                    html: message,
                    customClass: {
                        confirmButton: "custom-ok-button-class",
                    },
                    confirmButtonColor: "#039E57",
                });
                onDelete();
                // if (reloadPage) {
                //     setTimeout(() => {
                //         window.location.reload();
                //     }, 1000);
                // }
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <div className="" onClick={handleDelete}>
            {button}
        </div>
    );
};

export default ConfirmConfirmation;