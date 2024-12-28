import { CanvasManager } from './classes/canvas_manager.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container1');
    const canvasManager = new CanvasManager(container);
    window.canvasManager = canvasManager;

    // Gestionnaire d'événements pour les outils de dessin
    document.getElementById('btn-point')?.addEventListener('click', () => canvasManager.setCurrentTool('point'));
    document.getElementById('btn-milieu')?.addEventListener('click', () => canvasManager.setCurrentTool('milieu'));
    document.getElementById('btn-segment')?.addEventListener('click', () => canvasManager.setCurrentTool('segment'));
    document.getElementById('btn-segment-known')?.addEventListener('click', () => canvasManager.setCurrentTool('segment-known'));
    document.getElementById('btn-droite')?.addEventListener('click', () => canvasManager.setCurrentTool('droite'));
    document.getElementById('btn-parallele')?.addEventListener('click', () => canvasManager.setCurrentTool('parallele'));
    document.getElementById('btn-perpendiculaire')?.addEventListener('click', () => canvasManager.setCurrentTool('perpendiculaire'));
    document.getElementById('btn-compas')?.addEventListener('click', () => canvasManager.setCurrentTool('compas'));
    document.getElementById('btn-compas-known')?.addEventListener('click', () => canvasManager.setCurrentTool('compas-known'));
    document.getElementById('btn-text')?.addEventListener('click', () => canvasManager.setCurrentTool('text'));
    document.getElementById('btn-gomme')?.addEventListener('click', () => canvasManager.setCurrentTool('gomme'));
    document.getElementById('btn-angle')?.addEventListener('click', () => canvasManager.setCurrentTool('angle'));
    document.getElementById('btn-polygon')?.addEventListener('click', () => canvasManager.setCurrentTool('polygon'));

    // Gestionnaire d'événements pour les couleurs
    const colorPicker = document.getElementById('color-picker');
    const fillColorPicker = document.getElementById('fill-color-picker');
    const btnFill = document.getElementById('btn-fill');

    let selectedFillColor = fillColorPicker ? fillColorPicker.value : '#ff0000';
    let selectedStrokeColor = colorPicker ? colorPicker.value : '#000000';
    
    // Initialiser les couleurs
    canvasManager.setFillColor(selectedFillColor);

    if (colorPicker) {
        // Gestionnaire pour l'événement input (changement en temps réel)
        colorPicker.addEventListener('input', (e) => {
            console.log('Stroke color input:', e.target.value);
            selectedStrokeColor = e.target.value;
            const currentPage = canvasManager.getCurrentPage();
            if (currentPage) {
                currentPage.setStrokeColor(selectedStrokeColor);
            }
        });

        // Gestionnaire pour l'événement change (quand la sélection est terminée)
        colorPicker.addEventListener('change', (e) => {
            console.log('Stroke color change:', e.target.value);
            selectedStrokeColor = e.target.value;
            const currentPage = canvasManager.getCurrentPage();
            if (currentPage) {
                currentPage.setStrokeColor(selectedStrokeColor);
            }
        });
    }

    if (fillColorPicker) {
        // Gestionnaire pour l'événement input (changement en temps réel)
        fillColorPicker.addEventListener('input', (e) => {
            console.log('Fill color input:', e.target.value);
            selectedFillColor = e.target.value;
            canvasManager.setFillColor(selectedFillColor);
        });

        // Gestionnaire pour l'événement change (quand la sélection est terminée)
        fillColorPicker.addEventListener('change', (e) => {
            console.log('Fill color change:', e.target.value);
            selectedFillColor = e.target.value;
            canvasManager.setFillColor(selectedFillColor);
        });
    }

    if (btnFill) {
        btnFill.addEventListener('click', () => {
            console.log('Fill button clicked, using color:', selectedFillColor);
            canvasManager.setCurrentTool('fill');
            canvasManager.setFillColor(selectedFillColor);
        });
    }

    // Gestionnaire d'événements pour l'outil de remplissage
    // document.getElementById('btn-fill')?.addEventListener('click', () => {
    //     canvasManager.setCurrentTool('fill');
    // });

    // Gestionnaire d'événements pour la navigation des pages
    document.getElementById('btn-add')?.addEventListener('click', () => canvasManager.addPage());
    document.getElementById('btn-remove')?.addEventListener('click', () => canvasManager.removePage());

    // Gestionnaire d'événements pour le chargement de PDF
    const pdfInput = document.getElementById('pdf-input');
    const fileName = document.getElementById('file-name');

    pdfInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = file.name;
            
            if (file.type === 'application/pdf') {
                try {
                    const fileReader = new FileReader();
                    fileReader.onload = async function() {
                        const typedarray = new Uint8Array(this.result);
                        
                        // Chargement du PDF
                        const pdf = await pdfjsLib.getDocument(typedarray).promise;
                        console.log('PDF chargé avec', pdf.numPages, 'pages');
                        
                        // Pour chaque page du PDF
                        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                            const page = await pdf.getPage(pageNum);
                            const viewport = page.getViewport({ scale: 1.5 });
                            
                            // Créer un nouveau canvas si nécessaire
                            const canvasPage = pageNum === 1 ? canvasManager.getCurrentPage() : canvasManager.addPage();
                            if (!canvasPage) continue;
                            
                            // Ajuster la taille du canvas
                            canvasPage.canvas.width = viewport.width;
                            canvasPage.canvas.height = viewport.height;
                            canvasPage.pdfCanvas.width = viewport.width;
                            canvasPage.pdfCanvas.height = viewport.height;
                            
                            // Dessiner la page du PDF
                            await page.render({
                                canvasContext: canvasPage.pdfContext,
                                viewport: viewport
                            }).promise;
                            
                            // Redessiner tout
                            canvasPage.redraw();
                            console.log(`Page ${pageNum} rendue`);
                        }
                    };
                    fileReader.readAsArrayBuffer(file);
                } catch (error) {
                    console.error('Erreur lors du chargement du PDF:', error);
                }
            } else if (file.type.startsWith('image/')) {
                const img = new Image();
                img.onload = function() {
                    const canvasPage = canvasManager.getCurrentPage();
                    if (!canvasPage) return;
                    
                    // Ajuster la taille du canvas
                    canvasPage.canvas.width = img.width;
                    canvasPage.canvas.height = img.height;
                    canvasPage.pdfCanvas.width = img.width;
                    canvasPage.pdfCanvas.height = img.height;
                    
                    // Dessiner l'image
                    canvasPage.pdfContext.drawImage(img, 0, 0);
                    canvasPage.redraw();
                };
                img.src = URL.createObjectURL(file);
            }
        }
    });

    // Gestionnaire d'événements pour le popup Glisser Nombre
    const nombrePopup = document.getElementById('glisser-nombre-popup');
    document.getElementById('btn-glisser-nombre')?.addEventListener('click', () => {
        nombrePopup.style.display = 'block';
    });

    nombrePopup.querySelector('.close')?.addEventListener('click', () => {
        nombrePopup.style.display = 'none';
    });

    // Gestionnaire d'événements pour le popup Glisser Mesure
    const mesurePopup = document.getElementById('glisser-mesure-popup');
    document.getElementById('btn-glisser-mesure')?.addEventListener('click', () => {
        mesurePopup.style.display = 'block';
    });

    mesurePopup.querySelector('.close')?.addEventListener('click', () => {
        mesurePopup.style.display = 'none';
    });

    // Gestionnaire pour l'export PDF
    document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
        // Initialiser jsPDF
        const { jsPDF } = window.jspdf;

        // Créer un nouveau document PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [794, 1123] // Format A4 en pixels
        });

        // Pour chaque page du canvas
        canvasManager.pages.forEach((page, index) => {
            // Si ce n'est pas la première page, ajouter une nouvelle page
            if (index > 0) {
                pdf.addPage();
            }

            // Convertir le canvas en image
            const imgData = page.canvas.toDataURL('image/jpeg', 1.0);
            
            // Ajouter l'image au PDF
            pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1123);
        });

        // Sauvegarder le PDF
        pdf.save('geometrie.pdf');
    });

    // Gestion des popups déplaçables
    function initDraggablePopup(popupId) {
        const popup = document.getElementById(popupId);
        const header = popup.querySelector('.popup-header');
        const closeBtn = popup.querySelector('.close-button');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        // Position initiale au centre
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header || e.target.parentNode === header) {
                isDragging = true;
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                popup.style.transform = 'none';
                popup.style.left = currentX + 'px';
                popup.style.top = currentY + 'px';
            }
        }

        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }

        // Gestionnaires d'événements pour le déplacement
        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        // Fermeture du popup
        closeBtn.addEventListener('click', () => {
            popup.style.display = 'none';
        });

        // Ouvrir le popup
        document.getElementById('btn-glisser-mesure').addEventListener('click', () => {
            popup.style.display = 'block';
            // Réinitialiser la position
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
        });
    }

    // Initialiser le popup déplaçable
    initDraggablePopup('glisser-mesure-popup');
});
