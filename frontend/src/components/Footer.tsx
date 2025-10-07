const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">關於我們</h3>
            <p className="text-gray-300">
              我們致力於幫助流浪貓狗找到溫暖的家，為它們創造更美好的未來。
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">快速連結</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/listings" className="hover:text-white">
                  領養寵物
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white">
                  關於我們
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white">
                  聯絡我們
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">聯絡資訊</h3>
            <div className="text-gray-300 space-y-2">
              <p>電話: (02) 1234-5678</p>
              <p>信箱: contact@petadoption.com</p>
              <p>地址: 台北市信義區信義路五段123號</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2024 寵物領養平台. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer