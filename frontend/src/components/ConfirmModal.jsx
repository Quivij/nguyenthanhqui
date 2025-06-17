const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-gray">
            Huỷ
          </button>
          <button onClick={onConfirm} className="btn btn-red">
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
