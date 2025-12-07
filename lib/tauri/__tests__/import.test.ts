/**
 * Tests for import module
 */

import {
  importCsvContent,
  importAutoDetect,
  detectCsvFormat,
  validateCsvMapping,
  previewCsvContent,
  importFromFile,
} from "../import";

// Mock isTauri to always return false for browser fallback testing
jest.mock("../platform", () => ({
  isTauri: () => false,
  invoke: jest.fn(),
}));

describe("Import Module", () => {
  describe("importCsvContent (browser fallback)", () => {
    it("should parse basic CSV", async () => {
      const csv = "name,ra,dec\nM31,00:42:44,+41:16:09\nM42,05:35:16,-05:23:28";
      const result = await importCsvContent(csv);

      expect(result.success).toBe(true);
      expect(result.targets.length).toBe(2);
      expect(result.targets[0].targetName).toBe("M31");
      expect(result.targets[1].targetName).toBe("M42");
    });

    it("should handle decimal coordinates", async () => {
      const csv = "name,ra,dec\nTest,12.5,45.5";
      const result = await importCsvContent(csv);

      expect(result.success).toBe(true);
      expect(result.targets.length).toBe(1);
      expect(result.targets[0].coordinates.raHours).toBe(12);
    });

    it("should handle negative declination", async () => {
      const csv = "name,ra,dec\nTest,12:00:00,-45:30:00";
      const result = await importCsvContent(csv);

      expect(result.success).toBe(true);
      expect(result.targets[0].coordinates.negativeDec).toBe(true);
    });

    it("should handle empty CSV", async () => {
      const result = await importCsvContent("");

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle CSV with missing columns", async () => {
      const csv = "name,other\nM31,test";
      const result = await importCsvContent(csv);

      expect(result.targets.length).toBe(0);
    });

    it("should handle quoted fields", async () => {
      const csv = 'name,ra,dec\n"Andromeda Galaxy",00:42:44,+41:16:09';
      const result = await importCsvContent(csv);

      expect(result.success).toBe(true);
      expect(result.targets[0].targetName).toBe("Andromeda Galaxy");
    });

    it("should use custom column mapping", async () => {
      const csv = "object,right_ascension,declination\nM31,00:42:44,+41:16:09";
      const result = await importCsvContent(csv, {
        nameColumn: "object",
        raColumn: "right_ascension",
        decColumn: "declination",
        hasHeader: true,
      });

      expect(result.success).toBe(true);
      expect(result.targets.length).toBe(1);
    });
  });

  describe("importAutoDetect (browser fallback)", () => {
    it("should detect and parse CSV", async () => {
      const csv = "name,ra,dec\nM31,00:42:44,+41:16:09";
      const result = await importAutoDetect(csv, "csv");

      expect(result.success).toBe(true);
      expect(result.targets.length).toBe(1);
    });

    it("should fail for unsupported formats", async () => {
      const result = await importAutoDetect("<xml></xml>", "xml");

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("detectCsvFormat (browser fallback)", () => {
    it("should detect Telescopius format", async () => {
      const headers = ["Catalogue Entry", "Familiar Name", "RA"];
      const format = await detectCsvFormat(headers);

      expect(format).toBe("Telescopius");
    });

    it("should detect Generic format", async () => {
      const headers = ["name", "ra", "dec"];
      const format = await detectCsvFormat(headers);

      expect(format).toBe("Generic");
    });

    it("should return Unknown for unrecognized headers", async () => {
      const headers = ["foo", "bar"];
      const format = await detectCsvFormat(headers);

      expect(format).toBe("Unknown");
    });
  });

  describe("validateCsvMapping (browser fallback)", () => {
    it("should validate correct mapping", async () => {
      const headers = ["name", "ra", "dec"];
      const mapping = {
        nameColumn: "name",
        raColumn: "ra",
        decColumn: "dec",
        hasHeader: true,
      };

      const errors = await validateCsvMapping(headers, mapping);

      expect(errors.length).toBe(0);
    });

    it("should report missing columns", async () => {
      const headers = ["name", "other"];
      const mapping = {
        raColumn: "ra",
        decColumn: "dec",
        hasHeader: true,
      };

      const errors = await validateCsvMapping(headers, mapping);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("previewCsvContent (browser fallback)", () => {
    it("should return preview rows", async () => {
      const csv = "name,ra,dec\nM31,00:42:44,+41:16:09\nM42,05:35:16,-05:23:28";
      const preview = await previewCsvContent(csv, 2);

      expect(preview.length).toBe(2);
      expect(preview[0]).toContain("name");
    });

    it("should limit rows", async () => {
      const csv = "a,b\n1,2\n3,4\n5,6\n7,8";
      const preview = await previewCsvContent(csv, 2);

      expect(preview.length).toBe(2);
    });
  });

  describe("importFromFile", () => {
    it("should import from File object", async () => {
      const content = "name,ra,dec\nM31,00:42:44,+41:16:09";

      // Create a mock File with text() method
      const mockFile = {
        name: "test.csv",
        type: "text/csv",
        text: jest.fn().mockResolvedValue(content),
      } as unknown as File;

      const result = await importFromFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.targets.length).toBe(1);
    });
  });

  describe("Import statistics", () => {
    it("should track import statistics", async () => {
      const csv =
        "name,ra,dec\nM31,00:42:44,+41:16:09\nBad,invalid,data\nM42,05:35:16,-05:23:28";
      const result = await importCsvContent(csv);

      expect(result.totalRows).toBe(3);
      expect(result.importedCount).toBe(2);
      expect(result.skippedCount).toBe(1);
    });
  });
});
