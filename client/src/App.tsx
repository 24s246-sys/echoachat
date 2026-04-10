import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// API Base URL (Render 배포 시에는 상대 경로로 자동 작동함)
const API_BASE = '/api';

// --- Components ---

// 1. 게시판 목록 (Gallery)
const Gallery = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const { slug = 'main' } = useParams();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/galleries/${slug}/posts`);
        setPosts(res.rows || res.data); // 서버 응답 구조에 맞게 조정
      } catch (err) {
        console.error('Failed to fetch posts', err);
      }
    };
    fetchPosts();
  }, [slug]);

  return (
    <div className="main-content">
      <h2>{slug.toUpperCase()} 갤러리</h2>
      <table className="post-table">
        <thead>
          <tr>
            <th style={{ width: '80px' }}>번호</th>
            <th>제목</th>
            <th style={{ width: '120px' }}>글쓴이</th>
            <th style={{ width: '100px' }}>날짜</th>
            <th style={{ width: '60px' }}>조회</th>
            <th style={{ width: '60px' }}>추천</th>
          </tr>
        </thead>
        <tbody>
          {posts.length > 0 ? posts.map((post) => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td className="title">
                <Link to={`/post/${post.id}`} style={{ color: '#333', textDecoration: 'none' }}>
                  {post.title}
                </Link>
              </td>
              <td>{post.author_name} ({post.author_ip})</td>
              <td>{new Date(post.created_at).toLocaleDateString()}</td>
              <td>{post.views}</td>
              <td>{post.recommends}</td>
            </tr>
          )) : (
            <tr><td colSpan={6} style={{ padding: '50px' }}>게시글이 없습니다. 첫 글을 작성해 보세요!</td></tr>
          )}
        </tbody>
      </table>
      <Link to="/write" className="btn-write">글쓰기</Link>
    </div>
  );
};

// 2. 글쓰기 (Write)
const Write = () => {
  const [form, setForm] = useState({ title: '', content: '', author_name: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/posts`, {
        ...form,
        gallery_id: 1, // 테스트용 메인 갤러리 ID
        author_ip: '1.2.3.4' // 임시 IP
      });
      navigate('/');
    } catch (err) {
      alert('글 작성 실패');
    }
  };

  return (
    <div className="main-content">
      <h2>게시글 작성</h2>
      <form onSubmit={handleSubmit} className="write-form">
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            placeholder="닉네임" 
            style={{ width: '150px' }} 
            onChange={e => setForm({...form, author_name: e.target.value})} 
            required 
          />
          <input 
            type="password" 
            placeholder="비밀번호" 
            style={{ width: '150px' }} 
            onChange={e => setForm({...form, password: e.target.value})} 
            required 
          />
        </div>
        <input 
          placeholder="제목을 입력하세요" 
          onChange={e => setForm({...form, title: e.target.value})} 
          required 
        />
        <textarea 
          placeholder="내용을 입력하세요" 
          onChange={e => setForm({...form, content: e.target.value})} 
          required 
        />
        <button type="submit" className="btn-write" style={{ float: 'none', width: '100px' }}>등록</button>
      </form>
    </div>
  );
};

// 3. 메인 앱 레이아웃
function App() {
  return (
    <Router>
      <div className="container">
        <header>
          <h1><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>DC-COMMUNITY</Link></h1>
          <div>로그인 | 회원가입</div>
        </header>
        <nav>
          <ul className="gallery-list">
            <li><Link to="/" style={{ color: '#3b4890', textDecoration: 'none' }}>메인</Link></li>
            <li>마이너</li>
            <li>미니</li>
            <li>갤로그</li>
          </ul>
        </nav>
        
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/write" element={<Write />} />
          {/* 포스트 상세보기 등 추가 가능 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
