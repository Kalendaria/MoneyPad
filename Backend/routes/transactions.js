const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const ctrl    = require('../controllers/transactionsController');

router.get('/', auth, async (req, res) => {
  if (req.query.date)  return ctrl.getByDate(req, res);
  if (req.query.month) return ctrl.getByMonth(req, res);
  res.status(400).json({ message: 'Provide ?month= or ?date=' });
});
router.post  ('/',    auth, ctrl.create);
router.put   ('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;