import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Modal from 'react-modal';
import styles from './ImageCropModal.module.css';
import { TwoButtonsInline, TextButton } from './MyButton';
import config from '../config/config.json';

// upload image
const ImagePicker = ({ onConfirm }) => {
    const pickCropImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => onConfirm(reader.result);
                reader.onerror = error => console.error('Error: ', error);
            }
        };
        input.click();
    };
    return (
        <TextButton title={'Upload Extra Info'} onPress={pickCropImage} />
    );
}

// upload image and crop, use in portrait
const ImageCropModal = ({ onConfirm, icon }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [src, setSrc] = useState(null);
    const [croppedImageUrl, setCroppedImageUrl] = useState(null);
    const imageRef = useRef(null);
    // set crop configuration
    const [crop, setCrop] = useState({
        unit: 'px',
        height: config.userIcon.height,
        width: config.userIcon.width,
        aspect: 1
    });

    const pickCropImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    setSrc(reader.result);
                    setModalVisible(true);
                }
                reader.onerror = error => console.error('Error: ', error);
            }
        };
        input.click();
    };

    const onCropChange = (newCrop) => {
        newCrop.aspect = 1;
        let size = Math.min(newCrop.width, newCrop.height);
        newCrop.width = size;
        newCrop.height = size;
        setCrop(newCrop);
    };

    const onCropCompleteHandler = async (crop) => {
        if (imageRef.current && crop.width && crop.height) {
            const croppedUrl = await getCroppedImg(imageRef.current, crop, 'newFile.jpeg');
            setCroppedImageUrl(croppedUrl);
        }
    };

    // get cropped image, resize to my size
    const getCroppedImg = (image, crop) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        // Resize the cropped image to 64x64
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = config.userIcon.width;
        finalCanvas.height = config.userIcon.height;
        const finalCtx = finalCanvas.getContext('2d');

        finalCtx.drawImage(
            canvas,
            0,
            0,
            crop.width,
            crop.height,
            0,
            0,
            config.userIcon.width,
            config.userIcon.height
        );

        return new Promise((resolve) => {
            resolve(finalCanvas.toDataURL('image/jpeg'));
        });
    };

    return (
        <>
            <TextButton title={icon} onPress={pickCropImage} />
            {modalVisible && (
                <Modal
                    isOpen={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                    contentLabel="Crop Image"
                    className={styles.modal}
                    overlayClassName={styles.overlay}
                >
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>Crop Image</h2>
                        <ReactCrop
                            crop={crop}
                            circularCrop
                            ruleOfThirds
                            keepSelection
                            onComplete={onCropCompleteHandler}
                            onChange={onCropChange}
                        >
                            <img alt="Crop" src={src} ref={imageRef} className={styles.image} />
                        </ReactCrop>
                        <TwoButtonsInline
                            title1={'Confirm'}
                            title2={'Cancel'}
                            onPress1={() => {
                                onConfirm(croppedImageUrl)
                                setModalVisible(false);
                                setSrc(null);
                            }}
                            onPress2={() => {
                                setModalVisible(false);
                                setSrc(null);
                            }}
                            disable1={!croppedImageUrl}
                            disable2={false}
                        />
                    </div>
                </Modal>
            )}
        </>
    );
};

export { ImageCropModal, ImagePicker };
