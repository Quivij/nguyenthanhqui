import { useState, useEffect } from "react";

export default function AddressSelector({ onSelect, defaultValue }) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  // Load danh sách tỉnh khi mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=1")
      .then((res) => res.json())
      .then((data) => setProvinces(data));
  }, []);

  // Khởi tạo giá trị mặc định nếu có
  useEffect(() => {
    if (defaultValue) {
      const { province, district, ward } = defaultValue;

      if (province) {
        setSelectedProvince(province);
        // Load districts của tỉnh
        fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
          .then((res) => res.json())
          .then((data) => {
            setDistricts(data.districts || []);
            if (district) {
              setSelectedDistrict(district);
              // Load wards của huyện
              fetch(
                `https://provinces.open-api.vn/api/d/${district.code}?depth=2`
              )
                .then((res) => res.json())
                .then((data) => {
                  setWards(data.wards || []);
                  if (ward) setSelectedWard(ward);
                });
            }
          });
      }
    }
  }, [defaultValue]);

  const handleSelectProvince = (province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setWards([]);
    // Load districts khi chọn tỉnh mới
    fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
      .then((res) => res.json())
      .then((data) => setDistricts(data.districts || []));
  };

  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    setSelectedWard(null);
    // Load wards khi chọn huyện mới
    fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
      .then((res) => res.json())
      .then((data) => setWards(data.wards || []));
  };

  const handleSelectWard = (ward) => {
    setSelectedWard(ward);
    const fullAddress = {
      province: selectedProvince,
      district: selectedDistrict,
      ward: ward,
    };
    onSelect(fullAddress);
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded shadow-lg p-4">
      <h2 className="text-lg font-semibold mb-2">Chọn địa chỉ nhận hàng</h2>

      <div className="flex gap-4">
        {/* Province */}
        <div className="w-1/3 overflow-y-auto max-h-72 border-r">
          <h3 className="font-bold mb-1 text-blue-600">Tỉnh/TP</h3>
          {provinces.map((p) => (
            <div
              key={p.code}
              onClick={() => handleSelectProvince(p)}
              className={`cursor-pointer p-2 hover:bg-blue-100 ${
                selectedProvince?.code === p.code ? "bg-blue-200" : ""
              }`}
            >
              {p.name}
            </div>
          ))}
        </div>

        {/* District */}
        <div className="w-1/3 overflow-y-auto max-h-72 border-r">
          <h3 className="font-bold mb-1 text-blue-600">Quận/Huyện</h3>
          {districts.map((d) => (
            <div
              key={d.code}
              onClick={() => handleSelectDistrict(d)}
              className={`cursor-pointer p-2 hover:bg-blue-100 ${
                selectedDistrict?.code === d.code ? "bg-blue-200" : ""
              }`}
            >
              {d.name}
            </div>
          ))}
        </div>

        {/* Ward */}
        <div className="w-1/3 overflow-y-auto max-h-72">
          <h3 className="font-bold mb-1 text-blue-600">Phường/Xã</h3>
          {wards.map((w) => (
            <div
              key={w.code}
              onClick={() => handleSelectWard(w)}
              className={`cursor-pointer p-2 hover:bg-blue-100 ${
                selectedWard?.code === w.code ? "bg-blue-200" : ""
              }`}
            >
              {w.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
