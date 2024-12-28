import { CanvasPage } from './canvas.js';

export class CanvasManager {
  constructor(container) {
    this.container = container;
    this.pages = [];
    this.currentPage = null;
    this.currentTool = null;
    
    // Créer la première page
    this.addPage();
  }

  addPage() {
    // Créer un nouveau canvas
    const canvas = document.createElement('canvas');
    canvas.width = 794;  // Format A4 en pixels (21cm * 37.795)
    canvas.height = 1123; // Format A4 en pixels (29.7cm * 37.795)
    canvas.style.border = '1px solid black';
    canvas.style.margin = '10px';
    canvas.style.backgroundColor = 'white';
    this.container.appendChild(canvas);

    try {
      const ctx = canvas.getContext('2d');
      const page = new CanvasPage(canvas, ctx);
      this.pages.push(page);
      
      // Si c'est la première page ou si aucune page courante n'est définie
      if (!this.currentPage) {
        this.currentPage = page;
      }

      // Appliquer l'outil courant à la nouvelle page
      if (this.currentTool) {
        page.setActiveTool(this.currentTool);
      }

      return page;
    } catch (error) {
      console.error('Erreur lors de la création de la page:', error);
      return null;
    }
  }

  removePage() {
    if (this.pages.length <= 1) {
      console.log('Impossible de supprimer la dernière page');
      return;
    }

    const pageIndex = this.pages.indexOf(this.currentPage);
    if (pageIndex !== -1) {
      // Supprimer le canvas du DOM
      this.currentPage.canvas.remove();
      
      // Supprimer la page du tableau
      this.pages.splice(pageIndex, 1);
      
      // Mettre à jour la page courante
      this.currentPage = this.pages[Math.max(0, pageIndex - 1)];
    }
  }

  setCurrentTool(tool) {
    console.log('Changement d\'outil vers:', tool);
    this.currentTool = tool;
    // Mettre à jour l'outil actif sur la page courante
    if (this.currentPage) {
      this.currentPage.setActiveTool(tool);
    }
    // Mettre à jour l'outil actif sur toutes les pages
    this.pages.forEach(page => {
      page.setActiveTool(tool);
    });
  }

  setFillColor(color) {
    console.log('Setting fill color in CanvasManager:', color);
    if (this.currentPage) {
      this.currentPage.setFillColor(color);
    } else {
      console.warn('No current page to set fill color');
    }
  }

  getCurrentPage() {
    return this.currentPage;
  }

  getPages() {
    return this.pages;
  }
}
