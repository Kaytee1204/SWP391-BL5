# VocabularyCategory UI Test Cases

## Test Environment
- URL: http://localhost:3001
- User: Alex (lecturer) - Token: eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhbGV4QGdtYWlsLmNvbSIsImFjY291bnRJZCI6NiwiZnVsbE5hbWUiOiJBbGV4IiwiaWF0IjoxNzg3MDY1Mzk3LCJleHAiOjE3ODcxNTE3OTd9.MktSyKSvTFLkC8dadpwR4uDLPi4nDcDOlXDEpvp3RYQYEfmOlIcT7z0mBdENjVcv

---

## Test Case 1: Page Load & Render
**Steps:**
1. Navigate to http://localhost:3001
2. Login with Alex account
3. Navigate to Vocabulary Category feature

**Expected Results:**
- ✅ Page title "Quản lý Danh mục Từ vựng" displays
- ✅ "+ Thêm mới" button is visible (green color)
- ✅ CategoryTable is rendered (may be empty initially)
- ✅ No console errors

**Status:** 🔵 Ready to Test

---

## Test Case 2: Open Add New Modal
**Steps:**
1. Click "+ Thêm mới" button

**Expected Results:**
- ✅ Modal popup appears with title "Thêm mới danh mục"
- ✅ Form fields present:
  - Cấp độ JLPT dropdown (default: N5)
  - Tên danh mục input field
  - Mô tả chi tiết textarea
- ✅ "Hủy" and "Lưu lại" buttons visible
- ✅ Modal has semi-transparent backdrop

**Status:** 🔵 Ready to Test

---

## Test Case 3: Create New Category
**Steps:**
1. Click "+ Thêm mới"
2. Select JLPT Level: "N1"
3. Enter Name: "Advanced Business Japanese"
4. Enter Description: "Business vocabulary for advanced learners"
5. Click "Lưu lại"

**Expected Results:**
- ✅ Modal closes after submit
- ✅ Table refreshes with new category
- ✅ New row appears with correct data:
  - JLPT Level: N1 (blue highlight)
  - Name: "Advanced Business Japanese"
  - Description: "Business vocabulary for advanced learners"
  - Ngày tạo: Today's date
- ✅ "Sửa" and "Xóa" buttons available in action column

**Status:** 🔵 Ready to Test

---

## Test Case 4: Form Validation
**Steps:**
1. Click "+ Thêm mới"
2. Try submitting form without filling required fields

**Expected Results:**
- ✅ Form validation prevents empty submission
- ✅ "Tên danh mục" field shows required message (if browser validation)
- ✅ Form stays open

**Status:** 🔵 Ready to Test

---

## Test Case 5: Edit Existing Category
**Steps:**
1. Click "Sửa" button on any category row
2. Form modal opens with title "Sửa danh mục"
3. Modify values:
   - Change JLPT Level to "N2"
   - Change Name to "Updated Name"
   - Change Description to "Updated Description"
4. Click "Lưu lại"

**Expected Results:**
- ✅ Modal title shows "Sửa danh mục"
- ✅ Form fields pre-filled with current values
- ✅ After save, table updates with new values
- ✅ Modal closes

**Status:** 🔵 Ready to Test

---

## Test Case 6: Delete Category
**Steps:**
1. Click "Xóa" button on any category row
2. Confirm deletion (browser confirm dialog)

**Expected Results:**
- ✅ Browser confirmation dialog appears: "Bạn có chắc chắn muốn xóa danh mục này?"
- ✅ If confirmed, category removed from table
- ✅ Table refreshes without the deleted row
- ✅ If cancelled, row remains in table

**Status:** 🔵 Ready to Test

---

## Test Case 7: Close Modal Without Saving
**Steps:**
1. Click "+ Thêm mới"
2. Fill some fields (don't save)
3. Click "Hủy"

**Expected Results:**
- ✅ Modal closes
- ✅ Form data is cleared/reset
- ✅ No new category added to table
- ✅ Table unchanged

**Status:** 🔵 Ready to Test

---

## Test Case 8: Empty State
**Steps:**
1. Delete all categories (or first load with no data)

**Expected Results:**
- ✅ Table shows message: "Không có dữ liệu"
- ✅ Message spans across all columns
- ✅ Table structure remains visible
- ✅ Can still click "+ Thêm mới" to add first category

**Status:** 🔵 Ready to Test

---

## Test Case 9: Date Formatting
**Steps:**
1. View any category with createdAt date

**Expected Results:**
- ✅ Date displays in format: DD/MM/YYYY (Vietnamese format)
- ✅ Example: "19/08/2026" not "2026-08-19"

**Status:** 🔵 Ready to Test

---

## Test Case 10: JLPT Level Display
**Steps:**
1. View categories with different JLPT levels

**Expected Results:**
- ✅ JLPT Level displays in blue color (#2563eb)
- ✅ Bold font weight
- ✅ All levels (N5, N4, N3, N2, N1) work correctly

**Status:** 🔵 Ready to Test

---

## Checklist Summary

| Test Case | Component | Status |
|-----------|-----------|--------|
| 1 | Page Load | 🔵 Ready |
| 2 | Add Modal Open | 🔵 Ready |
| 3 | Create Category | 🔵 Ready |
| 4 | Form Validation | 🔵 Ready |
| 5 | Edit Category | 🔵 Ready |
| 6 | Delete Category | 🔵 Ready |
| 7 | Close Modal | 🔵 Ready |
| 8 | Empty State | 🔵 Ready |
| 9 | Date Format | 🔵 Ready |
| 10 | JLPT Display | 🔵 Ready |

---

## Notes
- All tests require valid JWT token in localStorage
- Backend API must be running on http://localhost:8080
- Frontend dev server must be running on http://localhost:3001
- No JavaScript errors should appear in browser console
