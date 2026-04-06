import { useRef, useState } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

// step: "upload" | "review" | "saving"
function FridgeImageUploadModal({ show, onClose, user_idx = 1, showToast, onSaveSuccess }) {
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("upload");
  const [detectedList, setDetectedList] = useState([]);

  const handleOpenFile = () => fileInputRef.current.click();

  const handleChangeFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      showToast?.("파일 없음", "업로드할 이미지를 선택해주세요.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:8000/analyze-fridge-image/${user_idx}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const ingredients = response.data.ingredients ?? [];
      setDetectedList(ingredients);
      setStep("review");
    } catch (error) {
      console.error("이미지 분석 실패:", error);
      showToast?.("분석 실패", "이미지 분석 중 문제가 발생했습니다.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleCountChange = (index, value) => {
    setDetectedList((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, count: Math.max(0, Number(value)) } : item
      )
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:8000/save-ingredients/${user_idx}`,
        { ingredients: detectedList }
      );
      showToast?.("저장 완료", response.data.message ?? "식재료가 저장되었습니다.", "success");
      onSaveSuccess?.();
      handleClose();
    } catch (error) {
      console.error("저장 실패:", error);
      showToast?.("저장 실패", "식재료 저장 중 문제가 발생했습니다.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImageFile(null);
    setPreviewUrl("");
    setDetectedList([]);
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {step === "upload" ? "식재료 이미지 업로드" : "분석 결과 확인"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {step === "upload" && (
          <>
            <p style={{ marginBottom: "12px", color: "#666" }}>
              냉장고 내부가 잘 보이는 사진을 업로드해주세요.
            </p>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleChangeFile}
            />

            {!previewUrl ? (
              <div
                onClick={handleOpenFile}
                style={{
                  border: "2px dashed #cfd8dc",
                  borderRadius: "12px",
                  padding: "40px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "#fafafa",
                }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>클릭해서 이미지 선택</p>
                <small style={{ color: "#777" }}>JPG, PNG 업로드 가능</small>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <img
                  src={previewUrl}
                  alt="미리보기"
                  style={{
                    width: "100%",
                    maxHeight: "320px",
                    objectFit: "contain",
                    borderRadius: "12px",
                    border: "1px solid #eee",
                  }}
                />
              </div>
            )}
          </>
        )}

        {step === "review" && (
          <>
            <img
              src={previewUrl}
              alt="업로드 사진"
              style={{
                width: "100%",
                maxHeight: "200px",
                objectFit: "contain",
                borderRadius: "12px",
                border: "1px solid #eee",
                marginBottom: "14px",
              }}
            />

            <p style={{ marginBottom: "10px", color: "#666", fontSize: "14px" }}>
              인식된 식재료를 확인하고 개수를 수정한 뒤 저장하세요.
            </p>

            {detectedList.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999" }}>
                인식된 식재료가 없습니다.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "220px", overflowY: "auto" }}>
                {detectedList.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#f8f8f8",
                      borderRadius: "10px",
                      padding: "10px 14px",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="number"
                      min={0}
                      value={item.count}
                      onChange={(e) => handleCountChange(index, e.target.value)}
                      style={{
                        width: "70px",
                        textAlign: "center",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        padding: "4px 8px",
                        fontSize: "14px",
                      }}
                    />
                    <span style={{ fontSize: "14px", color: "#555", minWidth: "20px" }}>{item.unit}</span>
                  </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          취소
        </Button>

        {step === "upload" && (
          <>
            {previewUrl && (
              <Button variant="outline-secondary" onClick={handleReset}>
                다시 선택
              </Button>
            )}
            <Button
              variant="success"
              onClick={previewUrl ? handleAnalyze : handleOpenFile}
              disabled={loading}
            >
              {loading ? "분석 중..." : previewUrl ? "분석하기" : "이미지 선택"}
            </Button>
          </>
        )}

        {step === "review" && (
          <>
            <Button variant="outline-secondary" onClick={() => setStep("upload")}>
              다시 촬영
            </Button>
            <Button variant="success" onClick={handleSave} disabled={loading}>
              {loading ? "저장 중..." : "냉장고에 저장"}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default FridgeImageUploadModal;
