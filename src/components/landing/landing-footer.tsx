export function LandingFooter() {
  return (
    <footer className="text-center text-sm text-muted-foreground border-t pt-8">
      <p>
        Built with Next.js, Tailwind CSS, and FastAPI &bull;{" "}
        <a
          href="https://github.com/NotHarshhaa/aws-infra-generator"
          className="underline underline-offset-4 hover:text-foreground"
        >
          GitHub
        </a>{" "}
        &bull; MIT License
      </p>
    </footer>
  );
}
