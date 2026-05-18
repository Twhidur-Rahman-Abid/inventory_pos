export const ErrorMessage = ({
  message = "There was an error.",
}: {
  message: string;
}) => {
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong className="font-bold">Error! </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export const NotFoundMessage = ({ message = "No data found." }) => {
  return (
    <div
      className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong className="font-bold">404! </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};
