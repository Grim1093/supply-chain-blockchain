import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { FaTerminal, FaCircle, FaWindowMinimize, FaRegWindowRestore, FaGripLines } from "react-icons/fa";
import { CONTRACT_ADDRESS, ABI } from "../contract";

function BlockchainTerminal() {
  const [logs, setLogs] = useState([]);
  
  // 🔹 STATE FOR POSITION & SIZE
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 350 });
  const [size, setSize] = useState({ w: 450, h: 300 });
  
  // 🔹 STATE FOR DOCKING
  const [isDocked, setIsDocked] = useState(false); 
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const scrollRef = useRef(null);

  // --- 1. DRAG LOGIC ---
  const handleMouseDown = (e) => {
    if (isResizing || isDocked) return; 
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // --- 2. RESIZE LOGIC ---
  const handleResizeStart = (e) => {
    if (isDocked) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
  };

  // --- 3. GLOBAL MOUSE MOVEMENT ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
      if (isResizing) {
        const newWidth = e.clientX - position.x;
        const newHeight = e.clientY - position.y;
        setSize({
          w: Math.max(300, newWidth),
          h: Math.max(100, newHeight)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, position, isDocked]);

  // --- 4. BLOCKCHAIN POLLING ---
  useEffect(() => {
    const fetchActivity = async () => {
      if (!window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        
        const count = await contract.productCount();
        const currentCount = Number(count);
        const newLogs = [];
        const start = Math.max(1, currentCount - 6); 

        for (let i = currentCount; i >= start; i--) {
          const product = await contract.products(i);
          const history = await contract.getProductHistory(i);
          
          if (history.length > 0) {
            const latest = history[history.length - 1];
            let action = "CREATED";
            if (latest.status.toString() === "1") action = "IN_TRANSIT";
            if (latest.status.toString() === "2") action = "DELIVERED";

            newLogs.push({
              time: new Date(Number(latest.timestamp) * 1000).toLocaleTimeString(),
              msg: `[#${i}] ${product.name} >> ${action} >> ${latest.handler.slice(0,6)}...`
            });
          }
        }
        setLogs(newLogs.reverse());
      } catch (err) { console.error(err); }
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  // 🔹 DYNAMIC STYLES FOR DOCKING
  const getTerminalStyle = () => {
    if (isDocked) {
      return {
        // DOCKED POSITION (Changed to Bottom Left)
        position: 'fixed',
        left: '20px',    // <--- CHANGED
        bottom: '20px',
        right: 'auto',   // <--- CHANGED
        top: 'auto',
        width: '200px',
        height: '40px', 
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 9999
      };
    } else {
      return {
        // WINDOW POSITION (Draggable)
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.w}px`,
        height: `${size.h}px`,
        transition: isDragging || isResizing ? 'none' : 'all 0.3s ease',
        zIndex: 9999
      };
    }
  };

  return (
    <div 
      className="floating-terminal"
      style={getTerminalStyle()}
    >
      {/* HEADER */}
      <div 
        className="terminal-header" 
        onMouseDown={handleMouseDown}
        style={{ cursor: isDocked ? 'pointer' : (isDragging ? 'grabbing' : 'grab') }}
        onClick={() => isDocked && setIsDocked(false)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaTerminal /> 
          <span style={{ fontWeight: "bold", letterSpacing: "1px" }}>
            {isDocked ? "NET.LOG" : "LIVE_FEED.exe"}
          </span>
          <span className="live-dot"><FaCircle /></span>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <div 
            className="control-icon" 
            onClick={(e) => {
              e.stopPropagation(); 
              setIsDocked(!isDocked);
            }}
          >
            {isDocked ? <FaRegWindowRestore /> : <FaWindowMinimize style={{ marginBottom: "5px" }} />}
          </div>
        </div>
      </div>

      {!isDocked && (
        <>
          <div className="terminal-body" ref={scrollRef}>
            {logs.length === 0 ? <div className="log-line">Connecting...</div> : logs.map((log, i) => (
              <div key={i} className="log-line">
                <span className="log-time">{log.time}</span> {log.msg}
              </div>
            ))}
            <div className="log-cursor">_</div>
          </div>
          
          <div 
            className="resize-handle"
            onMouseDown={handleResizeStart}
          >
            <FaGripLines style={{ transform: "rotate(45deg)", color: "#166534" }} />
          </div>
        </>
      )}
    </div>
  );
}

export default BlockchainTerminal;