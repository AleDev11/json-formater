export default function Footer() {
  return (
    <footer className="text-gray-400 text-center py-4 fixed bottom-2">
      <p>
        &copy; {new Date().getFullYear()}{' '}
        <a
          href="https://github.com/AleDev11"
          target="_blank"
          rel="noreferrer"
          className="text-blue-400 hover:underline"
        >
          AleDev
        </a>
      </p>
    </footer>
  );
}
