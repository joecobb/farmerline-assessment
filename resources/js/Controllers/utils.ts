import Swal from 'sweetalert2';

export const showLoadingAlert = (text: string) => {
    Swal.fire({
        title: 'Please wait',
        text: text,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

export const closeLoadingAlert = () => {
    Swal.close();
}
