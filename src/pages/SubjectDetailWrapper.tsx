import { useParams, useNavigate } from "react-router-dom";
import SubjectDetail from "./SubjectDetail";
import { useStore } from "../store/useStore";

const SubjectDetailWrapper = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const subjects = useStore((state) => state.subjects);

  const subject = subjects.find((item) => item.id === subjectId);

  if (!subject) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
        <h2 className="text-xl font-bold text-slate-800">
          Mata Pelajaran Tidak Ditemukan!
        </h2>
        <button
          onClick={() => navigate("/student")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer shadow-[0_4px_0_0_#3730a3]"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <SubjectDetail
      subject={subject}
      onBack={() => navigate("/student")}
      onLessonSelect={(lessonId) =>
        navigate(`/subjects/${subject.id}/lessons/${lessonId}`)
      }
    />
  );
};

export default SubjectDetailWrapper;
