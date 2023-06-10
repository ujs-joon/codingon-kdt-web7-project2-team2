import { Request, Response } from "express";
import db from "@/models";
import { isLogin, validateDate, getDateFromUrl, today } from "@/utils";

export default {
  daily,
  post,
  get,
  put,
  patch,
  destroy,
  destroyAll,
};

// page

//페이지 생성
async function daily(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (!user_id) return;
  let [year, month, date] = getDateFromUrl(req);
  if (!validateDate(year, month, date)) {
    [year, month, date] = today();
    return res.redirect(`/todo/${year}/${month}/${date}`);
  }
  res.render("todo/daily", { year, month, date });
}

// api

//투두 생성
async function post(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (!user_id) return;
  const [year, month, date] = getDateFromUrl(req);
  if (!validateDate(year, month, date)) {
    return res.status(400).json({ message: "날짜 형식이 잘못됨." });
  }
  const { content } = req.body;
  try {
    const result = await db.todo.create({
      user_id,
      year,
      month,
      date,
      content,
    });
    const todo = result.toJSON();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// 투두 조회
async function get(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) return;
    const [year, month, date] = getDateFromUrl(req);
    const result = await db.todo.findAll({
      where: {
        year,
        month,
        date,
        user_id,
      },
    });
    const todos = result.map((todo) => todo.toJSON());
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

//투두 수정
async function put(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) return;
    const { id } = req.params;
    const { content } = req.body;
    const result = await db.todo.update(
      { content },
      { where: { id, user_id } }
    );
    if (!result) {
      return res.status(404).json({ message: "Todo가 존재하지 않음." });
    }

    res.status(200).json({ message: "Todo 수정 완료." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// 투두 선택
async function patch(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) return;
    const { id } = req.params;
    const { checked } = req.body;
    const result = await db.todo.update(
      { checked },
      { where: { id, user_id } }
    );
    if (!result) {
      return res.status(404).json({ message: "Todo가 존재하지 않음." });
    }
    res.status(200).json({ message: "Todo 수정 완료." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

//투두 삭제
async function destroy(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user_id = await isLogin(req, res);
    if (!user_id) return;
    const result = await db.todo.destroy({
      where: { id, user_id },
    });

    if (result === 0) {
      return res.status(404).json({ message: "Todo가 존재하지 않음." });
    }

    res.status(200).json({ message: "Todo 삭제 완료." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

//투두 전체 삭제
async function destroyAll(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) return;
    const { year, month, date } = req.params;
    const result = await db.todo.destroy({
      //year, month, date, user_id가 일치하는 todo를 모두 삭제
      where: {
        year,
        month,
        date,
        user_id,
      },
    });

    if (result === 0) {
      return res.status(404).json({ message: "Todo가 존재하지 않음." });
    }

    res.status(200).json({ message: "Todo 삭제 완료." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
