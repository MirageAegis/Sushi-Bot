from os import getenv
import discord
from discord.ext import commands
from dotenv import load_dotenv


class ErrorHandler(commands.Cog):
    def __init__(self, bot: discord.Bot):
        self.bot = bot
        self.log_channel: discord.TextChannel

    @commands.Cog.listener()
    async def on_ready(self):
        load_dotenv()
        self.log_channel = self.bot.get_channel(int(getenv("LOG_CHANNEL")))

    @commands.Cog.listener()
    async def on_application_command_error(self, ctx: discord.ApplicationContext, error: discord.DiscordException):
        # Gets the cause of an ApplicationCommandInvokeError, which essentially wraps errors raised from within commands
        if isinstance(error, discord.errors.ApplicationCommandInvokeError):
            error = error.__cause__

        if isinstance(error, commands.MissingPermissions):
            await ctx.send_response("You do not have the required permission(s) to use this command", ephemeral=True)
        # Caused by a 403 Forbidden response from Discord
        elif isinstance(error, discord.Forbidden):
            await ctx.send_response(
                "This action is forbidden\n"
                "Either you or I may lack required permission(s) to perform it",
                ephemeral=True
            )
        await self.log_channel.send(
            "Error Report\n"
            f"User: {ctx.user}\n"
            f"Command: {ctx.command.name}\n"
            f"Payload: {error}\n"
            "---------------"
        )


def setup(bot: discord.Bot):
    bot.add_cog(ErrorHandler(bot))
