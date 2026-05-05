type NavbarProps = {
  myData?: {
    username?: string;
    branch_name?: string;
    first_name?: string;
    email?: string;
    role?: string;
  };
};

const Navbar = ({ myData }: NavbarProps) => {
  const { username, branch_name, first_name, email, role } = myData || {};

  return (
    <header className="sticky top-0 left-0 z-60 box-shadow-7 bg-white h-18 flex justify-center items-center border-b border-stock/10">
      <div className="px-5 w-full flex items-center justify-between ">
        <div className="flex items-center gap-20">
          <div className="hidden md:block">
            <h5 className="text-xl font-semibold text-textColor">
              Welcome {username} - {role} 👋
            </h5>
            <p className="text-sm text-c-black">
              <span className="text-body-text ">Here your</span> Fresh Food
              Dashboard{" "}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 md:gap-6">
          <div className="w-px h-7.5 bg-[#ccc]"></div>

          <div className="flex items-center gap-2.5 md:gap-3.75">
            <svg
              className=" min-w-20"
              width={75}
              height={73}
              viewBox="0 0 75 73"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_d_94_2266)">
                <circle cx="37.1914" cy={36} r={15} fill="white" />
                <circle
                  cx="37.1914"
                  cy={36}
                  r={14}
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                />
              </g>
              <mask
                id="mask0_94_2266"
                style={{ maskType: "alpha" as const }}
                maskUnits="userSpaceOnUse"
                x={22}
                y={21}
                width={31}
                height={30}
              >
                <circle
                  cx="37.1914"
                  cy={36}
                  r="14.5"
                  fill="white"
                  stroke="black"
                />
              </mask>
              <g mask="url(#mask0_94_2266)">
                <ellipse
                  cx="37.1653"
                  cy="49.265"
                  rx="7.8"
                  ry="8.61623"
                  transform="rotate(89.5691 37.1653 49.265)"
                  fill="var(--color-primary)"
                />
                <circle cx="37.1906" cy="33.8996" r="6.3" fill="#F2A444" />
              </g>
              <circle
                cx="47.2422"
                cy="25.9502"
                r="4.75"
                fill="var(--color-primary)"
                stroke="white"
                strokeWidth={2}
              />
              <defs>
                <filter
                  id="filter0_d_94_2266"
                  x="0.191406"
                  y={-1}
                  width={74}
                  height={74}
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity={0} result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation={11} />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0.12549 0 0 0 0 0.552941 0 0 0 0 0.996078 0 0 0 0.08 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_94_2266"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_94_2266"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>

            <div>
              <h6 className="text-sm sm:text-sm leading-4 md:text-md font-semibold text-secondary mb-0">
                {branch_name}
              </h6>
              <p className="text-xs sm:text-base leading-4 text-body-text mb-0">
                {first_name} <br /> {email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
