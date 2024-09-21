const CustomCursor = ({ position }) => {
  return (
    <div 
      className="custom-cursor" 
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        width: '20px',
        height: '20px',
        backgroundColor: 'red',
        borderRadius: '50%',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
      }}
    />
  );
};

export default CustomCursor;