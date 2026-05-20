import fs from 'fs/promises';
import path from 'path';
import { ImageResponse } from 'next/og';
import { LANGUAGE_COLORS } from '@/constants/languages';

const formatCount = (count) => {
  if (!count) return '0';
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toString();
};

const getLanguageColor = (language) => {
  if (!language) return '#858585';
  const key = language
    .toLowerCase()
    .replaceAll(' ', '-')
    .replaceAll('#', 'sharp')
    .replaceAll('+', 'p');
  return LANGUAGE_COLORS[key] || '#858585';
};

export const GET = async (request, { params }) => {
  try {
    const { owner, repository } = await params;

    const { searchParams } = new URL(request.url);
    const customTitle = searchParams.get('customTitle');
    const borderRadius = searchParams.get('borderRadius') || '0';
    const lightTheme = searchParams.get('lightTheme') === 'true';
    const singleLanguage = searchParams.get('singleLanguage') === 'true';
    const sharpProgress = searchParams.get('sharpProgress') === 'true';
    const styledProgress = searchParams.get('styledProgress') === 'true';

    const [interMedium, interBold] = await Promise.all([
      fs.readFile(path.join(process.cwd(), 'public/fonts/InterMedium.ttf')),
      fs.readFile(path.join(process.cwd(), 'public/fonts/InterBold.ttf')),
    ]);

    const headers = {
      'Content-Type': 'application/json',
      ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
    };

    const fetchOptions = {
      headers,
      next: { revalidate: 600 },
    };

    const [repositoryData, languagesData] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repository}`, fetchOptions).then((res) => {
        return res.json();
      }),
      fetch(`https://api.github.com/repos/${owner}/${repository}/languages`, fetchOptions).then(
        (res) => {
          if (res.status === 404) return {};
          return res.json();
        },
      ),
    ]);

    const languagesSum = Object.values(languagesData).reduce((acc, current) => acc + current, 0);
    const languagesPercentage = {};
    if (languagesSum > 0) {
      for (const [language, value] of Object.entries(languagesData)) {
        languagesPercentage[language] = ((value / languagesSum) * 100).toFixed(1);
      }
    }

    const cleanHomepage = repositoryData.homepage
      ? repositoryData.homepage.replace('https://', '').replace('http://', '')
      : '';

    const bgClass = lightTheme ? 'bg-white' : 'bg-black';
    const textClass = lightTheme ? 'text-black' : 'text-white';
    const altBgClass = lightTheme ? 'bg-neutral-200' : 'bg-neutral-700';
    const iconStroke = lightTheme ? '#000000' : '#ffffff';
    const bgColor = lightTheme ? '#ffffff' : '#000000';

    if (!repositoryData || repositoryData.message) {
      return new ImageResponse(
        <div
          tw={`flex flex-col w-[1200px] h-[630px] ${bgClass} ${textClass} justify-center items-center`}
          style={{ borderRadius: `${borderRadius}px` }}
        >
          <div tw={`flex flex-col ${altBgClass} p-4 rounded-3xl opacity-50`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={40}
              height={40}
              viewBox="0 0 24 24"
              fill="none"
              stroke={iconStroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <span
            tw="text-[35px] leading-none text-neutral-500 text-center mt-8"
            style={{ fontFamily: 'InterMedium' }}
          >
            Starlight can&apos;t access this repository.
          </span>
          <span
            tw="text-[35px] leading-none text-neutral-500 text-center mt-4"
            style={{ fontFamily: 'InterMedium' }}
          >
            It may not exist or be hidden by privacy settings.
          </span>
        </div>,
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: 'InterMedium',
              data: interMedium,
              style: 'normal',
            },
            {
              name: 'InterBold',
              data: interBold,
              style: 'normal',
            },
          ],
        },
      );
    }

    return new ImageResponse(
      <div
        tw={`flex flex-col w-[1200px] h-[630px] ${bgClass} ${textClass} p-[75px]`}
        style={{ borderRadius: `${borderRadius}px` }}
      >
        <div tw="flex flex-row w-full items-center opacity-50 justify-between">
          <div tw="flex flex-row items-center">
            <svg
              tw="mt-[4px]"
              xmlns="http://www.w3.org/2000/svg"
              width={30}
              height={30}
              viewBox="0 0 24 24"
              fill="none"
              stroke={iconStroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 2v8l3-3 3 3V2" />
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
            </svg>
            <span tw="ml-[10px] text-[35px] leading-none" style={{ fontFamily: 'InterMedium' }}>
              {repositoryData.full_name}
            </span>
          </div>

          {cleanHomepage && repositoryData.full_name.length <= 30 && (
            <div tw="flex flex-row items-center">
              <svg
                tw="mt-[4px]"
                xmlns="http://www.w3.org/2000/svg"
                width={30}
                height={30}
                viewBox="0 0 24 24"
                fill="none"
                stroke={iconStroke}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span tw="ml-[10px] text-[35px] leading-none" style={{ fontFamily: 'InterMedium' }}>
                {cleanHomepage}
              </span>
            </div>
          )}
        </div>

        <div tw="flex flex-row items-center mt-[40px] w-full">
          <div tw="flex flex-row max-w-[1000px] overflow-hidden">
            <span
              style={{
                fontFamily: 'InterBold',
                fontSize: '58px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {customTitle || repositoryData.name}
            </span>
          </div>
          {(customTitle || repositoryData.name).length <= 20 && (
            <div tw="flex flex-row flex-1 overflow-hidden pt-[4px] flex-nowrap relative ml-[10px]">
              {(repositoryData.topics || []).map((topic, index) => (
                <div
                  key={index}
                  tw={`${altBgClass} opacity-50 text-[28px] px-[15px] py-[5px] ml-[10px] rounded-full flex-shrink-0`}
                >
                  {topic}
                </div>
              ))}
              <div
                tw="absolute top-0 right-0 bottom-0 w-[200px] flex"
                style={{
                  backgroundImage: lightTheme
                    ? 'linear-gradient(to right, rgba(255,255,255,0), #ffffff 80%)'
                    : 'linear-gradient(to right, rgba(0,0,0,0), #000000 80%)',
                }}
              />
            </div>
          )}
        </div>

        <div tw="flex flex-col justify-between flex-1 mt-[20px]">
          <div tw="flex opacity-50 w-full">
            <span tw="text-[40px] max-w-full" style={{ fontFamily: 'InterMedium' }}>
              {repositoryData.description || 'There is no description for this repository.'}
            </span>
          </div>

          <div tw="flex flex-row w-full opacity-50 justify-start">
            <div tw="flex flex-row items-center flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke={iconStroke}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
              </svg>
              <span tw="text-[40px] ml-[15px] font-semibold" style={{ fontFamily: 'InterMedium' }}>
                {formatCount(repositoryData.stargazers_count)}
              </span>
            </div>

            <div tw="flex flex-row items-center flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke={iconStroke}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span tw="text-[40px] ml-[15px]" style={{ fontFamily: 'InterMedium' }}>
                {formatCount(repositoryData.subscribers_count)}
              </span>
            </div>

            <div tw="flex flex-row items-center flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke={iconStroke}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="1" />
              </svg>
              <span tw="text-[40px] ml-[15px] font-semibold" style={{ fontFamily: 'InterMedium' }}>
                {formatCount(repositoryData.open_issues)}
              </span>
            </div>

            <div tw="flex flex-row items-center flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke={iconStroke}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="6" r="3" />
                <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" />
                <path d="M12 12v3" />
              </svg>
              <span tw="text-[40px] ml-[15px] font-semibold" style={{ fontFamily: 'InterMedium' }}>
                {formatCount(repositoryData.forks)}
              </span>
            </div>
          </div>

          <div tw="flex w-full">
            <div
              tw="w-full h-5 flex flex-row overflow-hidden"
              style={{ borderRadius: sharpProgress ? '0px' : '30px' }}
            >
              {styledProgress ? (
                <div tw="w-full h-full" style={{ backgroundColor: iconStroke }} />
              ) : repositoryData.language ? (
                singleLanguage ? (
                  <div
                    tw="w-full h-full"
                    style={{ backgroundColor: getLanguageColor(repositoryData.language) }}
                  />
                ) : (
                  Object.entries(languagesPercentage).map(([lang, percent]) => (
                    <div
                      key={lang}
                      tw="h-full"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: getLanguageColor(lang),
                      }}
                    />
                  ))
                )
              ) : (
                <div tw="w-full h-full" style={{ backgroundColor: bgColor }} />
              )}
            </div>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'InterMedium',
            data: interMedium,
            style: 'normal',
          },
          {
            name: 'InterBold',
            data: interBold,
            style: 'normal',
          },
        ],
        headers: {
          'Cache-Control': 'public, max-age=600, must-revalidate',
        },
      },
    );
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};
