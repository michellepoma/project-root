function SearchBar({ placeholder = "Buscar...", onSearch }) {
    return (
      <input
        type="text"
        className="form-control mb-3"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
      />
    );
  }
  
  export default SearchBar;
  