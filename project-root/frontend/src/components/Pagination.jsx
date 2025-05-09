// src/components/Pagination.jsx
import "@/styles/Pagination.css";
function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
  
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
    return (
      <nav className="d-flex justify-content-center mt-4">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>
              &laquo;
            </button>
          </li>
  
          {pages.map((page) => (
            <li key={page} className={`page-item ${page === currentPage && "active"}`}>
              <button className="page-link" onClick={() => onPageChange(page)}>
                {page}
              </button>
            </li>
          ))}
    
          <li className={`page-item ${currentPage === totalPages && "disabled"}`}>
            <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    );
  }
  
  export default Pagination;
  