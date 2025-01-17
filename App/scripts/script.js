// Récupération des éléments HTML
const encodeButton = document.getElementById('encodeButton');
const decodeButton = document.getElementById('decodeButton');
const encodeImageInput = document.getElementById('encodeImageInput');
const decodeImageInput = document.getElementById('decodeImageInput');
const messageInput = document.getElementById('messageInput');
const decodedMessageElement = document.getElementById('decodedMessage');
const downloadLink = document.getElementById('downloadLink');

// Fonction d'encodage
encodeButton.addEventListener('click', () => {
    if (!encodeImageInput.files[0] || !messageInput.value) {
        alert("Veuillez charger une image et saisir un message.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;

            const message = messageInput.value + '[END]'; // Ajouter la signature de fin
            const binaryMessage = message.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');

            if (binaryMessage.length > data.length / 4) {
                alert("Le message est trop long pour cette image.");
                return;
            }

            for (let i = 0; i < binaryMessage.length; i++) {
                data[i * 4] = (data[i * 4] & 0xFE) | parseInt(binaryMessage[i]); // Modifier le bit LSB
            }

            ctx.putImageData(imageData, 0, 0);
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                downloadLink.href = url;
                downloadLink.download = 'image-encodee.png';
                downloadLink.style.display = 'block';
                downloadLink.textContent = 'Télécharger l\'image encodée';
            });
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(encodeImageInput.files[0]);
});

// Fonction de décodage
decodeButton.addEventListener('click', () => {
    if (!decodeImageInput.files[0]) {
        alert("Veuillez charger une image.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;

            let binaryMessage = '';
            for (let i = 0; i < data.length / 4; i++) {
                binaryMessage += (data[i * 4] & 1).toString(); // Extraire le LSB de chaque pixel
            }

            const bytes = binaryMessage.match(/.{8}/g).map(byte => parseInt(byte, 2));
            const message = bytes.map(byte => String.fromCharCode(byte)).join('');
            const endOfMessage = message.indexOf('[END]'); // Vérifier la présence de la signature

            if (endOfMessage >= 0) {
                decodedMessageElement.textContent = "Message extrait : " + message.slice(0, endOfMessage);
            } else {
                decodedMessageElement.textContent = "Aucun message valide trouvé dans l'image.";
            }
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(decodeImageInput.files[0]);
});
