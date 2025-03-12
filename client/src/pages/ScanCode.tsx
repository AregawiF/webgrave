import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function ScanCode() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!scannerRef.current && qrContainerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10, // Fra`me`s per second for scanning
          qrbox: { width: 250, height: 250 }, // Scanning area
          supportedScanTypes: [Html5QrcodeSupportedFormats.QR_CODE],
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          if (!scanResult) {
            setScanResult(decodedText);
            scannerRef.current?.clear(); // Stop scanning after success
            window.location.href = decodedText; // Redirect
          }
        },
        (errorMessage) => {
          console.warn("QR scan error:", errorMessage);
        }
      );
    }

    return () => {
      scannerRef.current?.clear(); // Cleanup on unmount
      scannerRef.current = null;
    };
  }, [scanResult]); // Runs when scanResult changes

  return (
    <div className="flex-1 flex items-center justify-center p-4 mt-20">
      <div className="text-center max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Scan QR Code</h2>

        {!scanResult ? (
          <div id="qr-reader" ref={qrContainerRef}></div>
        ) : (
          <p className="text-green-600 mt-4">Scanned: {scanResult}</p>
        )}
      </div>
    </div>
  );
}
