import { jest } from "@jest/globals";

describe("upload configuration", () => {
  let upload, handleMulterError;

  beforeEach(async () => {
    const uploadModule = await import("../../../src/config/upload.js");
    upload = uploadModule.upload;
    handleMulterError = uploadModule.handleMulterError;
  });

  describe("upload.single", () => {
    it("devrait exporter la fonction upload", () => {
      expect(upload).toBeDefined();
      expect(typeof upload.single).toBe("function");
    });
  });

  describe("handleMulterError", () => {
    it("devrait gérer les erreurs de taille de fichier", () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const err = {
        code: "LIMIT_FILE_SIZE",
        message: "File too large",
      };
      // Simuler une MulterError
      err.name = "MulterError";
      Object.setPrototypeOf(err, {
        constructor: { name: "MulterError" },
      });

      handleMulterError(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Fichier trop volumineux. Taille maximale : 5 MB.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait gérer les erreurs génériques multer", () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const err = {
        code: "SOME_ERROR",
        message: "Generic error",
      };
      err.name = "MulterError";
      Object.setPrototypeOf(err, {
        constructor: { name: "MulterError" },
      });

      handleMulterError(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur d'upload : Generic error",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait gérer les erreurs de validation de type de fichier", () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const err = new Error("Type de fichier non autorisé");

      handleMulterError(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Type de fichier non autorisé",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait appeler next() si aucune erreur", () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      handleMulterError(null, req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
