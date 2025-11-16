import express from 'express';
const router = express.Router();
router.post('/login',(req,res)=>{
  const {user,pass}=req.body;
  if(user==='admin' && pass==='admin') return res.json({ok:true,token:'ADMIN_OK'});
  return res.status(401).json({ok:false,error:'Invalid credentials'});
});
export default router;
