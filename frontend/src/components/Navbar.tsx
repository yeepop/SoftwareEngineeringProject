import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">
                🐾 寵物領養
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/listings"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
            >
              查看所有寵物
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  我的資料
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                  >
                    管理後台
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    {user.username}
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        登出
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  登入
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  註冊
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/listings"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                查看所有寵物
              </Link>
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    我的資料
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      管理後台
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
                  >
                    登出
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    登入
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    註冊
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar